# AGENTS.md

Compact guide for OpenCode agents working in this repo. Every line answers: "would an agent miss this without help?"

## Stack

- NestJS 11 + Fastify 5 (HTTP) + Prisma 6 + PostgreSQL + Redis (ioredis) + JWT (passport)
- TypeScript ES2021, CommonJS, path alias `@/*` -> `src/*`
- pnpm (`pnpm-lock.yaml`). No `postinstall` — Prisma client is **not** generated automatically.
- Logging: Winston via `LoggingConfigService`, shipped to Elasticsearch (`ELASTICSEARCH_NODE`).
- Timezone: `America/Santiago` (Luxon default + Docker `TZ`).

## Bootstrap & runtime

- Entry: `src/main.ts` builds a `NestFastifyApplication`. Body limit `1 MB`, `logger: false` on Fastify (Nest Logger still active).
- Root module: `src/app.module.ts` imports `ConfigModule` (global), `RedisModule` (global), `PrismaModule.forRootAsync` (global, with `explicitConnect: true`), and feature modules.
- Global API prefix: `APP_URL_PREFIX = "/api/v1"` (`src/commons/constants/constants.ts`). Excluded paths: `api/health`, `api/health/liveness`, `api/health/readiness`, `/`. **The comment in `main.ts` says "v2" — that's wrong; the constant is `v1`.**
- Swagger only mounted when `NODE_ENV === "qa"` at `/api/v1/docs`. To see docs locally, set `NODE_ENV=qa` (or any lowercase `qa`).
- Port + address come from `AppConfig.PORT` (default 3001) and `AppConfig.FASTIFY_ADDRESS` (default `0.0.0.0`).
- Global pieces wired in `main.ts`:
  - `LoggingInterceptor` — adds `X-Trace-Id` response header, skips `/api/v1/health/*`.
  - `HttpExceptionFilter` — response shape `{statusCode, timestamp, method, path, message, error, trace_id}` (note: `trace_id` is a fresh uuid per error, **not** the interceptor's `X-Trace-Id`).
  - `ValidationPipe` with `whitelist: true`, `transform: true`, `enableImplicitConversion: true`.
  - `BigInt.prototype.toJSON` patched to stringify (so Prisma BigInts serialize as strings, not crash JSON).
  - CORS allow-list: `APP_FRONT_END_URL` + `http://localhost:3000` + `http://127.0.0.1:3000` + `http://caja.local`. Preflight uses `204`. `Set-Cookie` is exposed.
  - URI versioning enabled (`/v1/...` is the prefix; not used in routes — controllers use plain paths under the prefix).
  - Cookie parser via `@fastify/cookie` with secret `'elSecretoDeLaAbuela'` (hard-coded — do not log this elsewhere).

## Auth model (read before touching any controller)

- Access JWT (15m) returned in body. Refresh JWT (7d) set as HttpOnly cookie on `path: /api/v1/auth/refresh` (`httpOnly: true`, `secure` only in production, `sameSite: lax|strict`).
- Login-lock: Redis key `caja:login:fail:<email>`, increments on failure, TTL set on first INCR. Defaults: `LOGIN_MAX_RETRIES=5`, `LOGIN_LOCK_SECONDS=300`. On success, key is deleted.
- Refresh tokens persisted in Redis under `caja:refresh:<userId>` for revocation. Access token hashes are stored in `users_tokens` (`is_revoked` flag).
- **No `APP_GUARD` is registered globally.** Guards are opt-in per controller:
  - `@UseGuards(JwtAuthGuard)` (or class-level) — required for any protected endpoint.
  - `@Public()` decorator skips JWT.
  - `@Roles(...)` + `RolesGuard` for role-based checks (queries `user_roles` table on every request — expect DB hit per request).
  - `ApikeyGuard` checks header `api-key` against `AppConfig.API_KEY`; not registered globally — wire it explicitly where needed.
- `request.user` after JWT validation: `{ id, roleNames }`.
- Reference: `src/modules/auth/`, decorators in `src/commons/decorators/`, strategies in `src/modules/auth/strategies/`.
- Endpoints (full path): `POST /api/v1/auth/authenticate`, `POST /api/v1/auth/register`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`.

## Commands (pnpm)

| Action | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Dev (watch) | `pnpm start:dev` |
| Dev (debug, port 9229) | `pnpm start:debug` |
| Build | `pnpm build` (output: `dist/src/main`) |
| Run prod | `pnpm start:prod` (runs `node dist/src/main`) |
| Lint (autofix) | `pnpm lint` |
| Format | `pnpm format` |
| Unit tests | `pnpm test` (rootDir=`src`, regex `*.spec.ts`, alias `@/*`, timeout 20s) |
| Watch tests | `pnpm test:watch` |
| Coverage | `pnpm test:cov` (output `../coverage`) |
| E2E | `pnpm test:e2e` (config `test/jest-e2e.json`, regex `*.e2e-spec.ts`) |
| Prisma migrate (dev) | `pnpm migrate:dev` |
| Prisma migrate (sql only) | `pnpm migrate:dev:create` |
| Prisma migrate (prod) | `pnpm migrate:deploy` |
| Prisma generate | `pnpm prisma:generate` (run after any schema change — there is no postinstall hook) |
| Prisma studio | `pnpm prisma:studio` |
| Prisma seed | `pnpm prisma:seed` |

Single test file: `pnpm test -- path/to/file.spec.ts`. To scope e2e, pass `--config ./test/jest-e2e.json --testPathPattern=...`.

## Prisma

- Schema: `prisma/schema.prisma`. Provider `postgresql`, URL from `DATABASE_URL`. `binaryTargets = ["native", "linux-musl"]` — required for the Alpine Docker image; do not drop `linux-musl`.
- Models use lowercase snake_case table names (e.g. `invoice`, `open_register`, `payment_method`). Generated client uses camelCase properties (e.g. `prisma.users.findFirst(...)`, `prisma.user_roles.findMany(...)`). **Do not rename tables without searching the codebase — the client is consumed in many places.**
- IDs are Postgres `uuid` via `@default(dbgenerated("gen_random_uuid()"))`. Requires `pgcrypto` or `uuid-ossp` — migration `20250620204718_init_database` enables it; do not assume the DB is fresh.
- Migrations live in `prisma/migrations/`. Lock file is present (`migration_lock.toml`).
- Seed (`prisma/seed.ts`): reads `prisma/seeders/<table>.json` arrays, uses each entry as a `where` filter for `findMany` and calls `create` only when empty. **Idempotency is shape-based**, not PK-based. Edit the seeders with that in mind.
- `AppConfig.PRISMA_LOG_OPTION` controls Prisma log levels (array of strings from env: `['error', 'warn', 'query', 'info']`).

## Docker

- `Dockerfile` (prod, npm): multi-stage, runs `npm run start:prod`, exposes 3000, copies `dist/`, `node_modules/`, `prisma/`. Used by `docker-compose.yml` (port 3000:3000, env from `.env`).
- `Dockerfile.back.dev` (dev, pnpm10): single stage, mounts source via `docker-compose-dev.yml` volume, runs `pnpm start:debug`, exposes 3001 + 9229. Re-runs `pnpm rebuild bcrypt` (needed for native module on Alpine).
- `docker-compose-dev.yml` includes `pgsql-example` (`postgres:14.0-alpine`, port 5433:5432, user `cash_admin` / pass `4639802`, db `caja`) and joins network `work`. The `.env` `DATABASE_URL` points at `db:5432` — only works inside the compose network.
- Named volume `emcajadigitalback` keeps `node_modules` out of the bind mount (don't fight it).

## Repo layout

```
src/
  main.ts                      # bootstrap, global prefix, swagger gate
  app.module.ts                # wires global modules + feature modules
  config/
    app/                       # AppConfig enum + service (typed app config namespace)
    health/                    # @nestjs/terminus setup
    logging/                   # Winston + Elasticsearch wiring
  commons/
    constants/                 # APP_URL_PREFIX, IS_PUBLIC_KEY, API_KEY_HEADER
    decorators/                # @Public, @Roles, @Cookies
    filters/                   # HttpExceptionFilter (note the trailing dot in filename)
    guards/                    # JwtAuthGuard, RolesGuard, ApikeyGuard
    interceptors/              # LoggingInterceptor
    services/, paginator/, validators/, ...
  modules/
    auth/                      # auth (JWT + refresh cookie + login-lock)
    open-register/             # cash register open/close
    transactions/              # invoices + payments
    reconciliation/            # shift reconciliation
    reports/                   # PDF reports (pdfkit)
    general-settings/          # entity / role / payment-method / professional / prevision CRUD
    redis/                     # @Global() RedisModule + RedisService
prisma/
  schema.prisma, migrations/, seed.ts, seeders/*.json
test/
  jest-e2e.json, app.e2e-spec.ts
```

## Conventions that diverge from defaults

- All services must return DTOs/types, **not raw Prisma models**, in controller responses. The copilot-instructions file is explicit about this; do not expose `prisma.<model>` directly in `ApiResponse` shapes.
- Use `prisma.$transaction(async tx => { ... })` for multi-step writes. Map Prisma errors to Nest exceptions: `P2002 -> ConflictException`, `P2025 -> NotFoundException`, `P2003 -> BadRequestException`.
- `class-validator` + `class-transformer` for DTOs; `@ApiProperty()` from `@nestjs/swagger` on every DTO field. `ValidationPipe` strips unknown fields.
- `DateTime` columns are returned as `Date` objects; format with Luxon (`Settings.defaultZone` already set to `America/Santiago`).
- Money is stored as `Int` (cents/units) — never as `Float`/`Decimal`. Keep that contract.
- Roles live in the DB (`roles` table) and are loaded per request by `RolesGuard` from `user_roles`. The TS enum `RolesAutentia` (`src/modules/auth/enum/autentia-rol.enum.ts`) is the source of truth on the TS side.
- Each feature module follows `dto/`, `entities/`, `guards/`, `*.controller.ts`, `*.service.ts`, `*.module.ts`. Nest scaffolding uses this layout — keep it.

## Quirks and traps (read before editing)

- `src/commons/filters/http-exception.filter..ts` has a **double trailing dot** in the filename. The import in `main.ts` uses that exact name. Don't "fix" the filename without updating the import.
- `.env` exists locally but is listed in `.gitignore`. The committed values (e.g. `db:5432`, `redis-caja`) are docker-network DNS names — they only resolve inside `docker-compose-dev.yml`. Do not assume they work on host.
- `.github/*.md` is in `.gitignore`, so `.github/copilot-instructions.md` is **not tracked**. Treat it as ephemeral local context. The architectural guidance in it is real, but not source-controlled here.
- `package.json` `lint-staged` glob is malformed: `"{src,apps,libs,test}/**/*.ts\""` (closing quote inside the value). The pre-commit hook likely runs `lint-staged` against an empty or unexpected pattern. If pre-commit silently does nothing, that's why.
- `eslint.config.mjs` has a hard-coded absolute `tsconfigRootDir` pointing at this exact checkout path. If you move the project, eslint may mis-resolve the project. Flat config and legacy `.eslintrc.js` both exist; `pnpm lint` invokes the legacy config and ESLint v9 may complain — test before assuming lint output is reliable.
- `src/app.controller.ts` `get('/')` only `console.log`s and returns nothing — incomplete. Tests in `app.controller.spec.ts` reference a `getHello()` method that doesn't exist on the controller. Don't run `pnpm test` blind; the default controller spec is broken. Run targeted specs (`pnpm test -- modules/auth/auth.service.spec.ts`).
- `prisma/seed.ts` line 2 imports `e from 'express'` but never uses it — leftover, harmless.
- `Dockerfile.back.dev` installs with `pnpm install` (not `pnpm install --frozen-lockfile`); the lockfile may drift on rebuilds.
- `JWT_REFRESH_EXPIRY` exists in env and is read by `AuthService` directly, but `JwtModule` in `auth.module.ts` is registered with hard-coded `expiresIn: '4h'`. If you change the access token lifetime, update both places.
- `LoggingConfigService` is a **singleton** (`getInstance()`), not injected. Do not refactor it to constructor injection without a sweep — `LoggingInterceptor` calls it both directly and via `@Inject(Logger)`.

## Pre-commit / hooks

- `.husky/pre-commit` sets `PATH` to include `/usr/local/bin` and `/home/seventrust/.local/share/pnpm`, then runs `pnpm precommit` -> `lint-staged` -> `eslint --fix` (on the malformed glob above). Husky version pinned via `prepare: "husky"`.
- `prepare` script runs `husky init` on `pnpm install` in fresh checkouts.

## Where to look first

- Endpoint wiring: `src/main.ts` + `src/app.module.ts` + the relevant `src/modules/<feature>/<feature>.controller.ts`.
- Config keys: `src/config/app/enums/app-config.enum.ts` (single enum), loaded via `AppConfigService` (wraps the `app` namespace from `.env`).
- Auth flow: `src/modules/auth/auth.service.ts` (login, refresh, logout) + `src/modules/auth/auth.controller.ts` (cookie path).
- Error response shape: `src/commons/filters/http-exception.filter..ts`.
- Prisma schema + enums: `prisma/schema.prisma`.
- Anything log-related: `src/config/logging/logging-config.service.ts` and `src/commons/interceptors/loggin.interceptor.ts` (note: misspelled "loggin" — preserve it).
