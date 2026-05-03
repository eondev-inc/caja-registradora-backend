import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  prismaLogOption: process.env.PRISMA_LOG_OPTION,
  apiKey: process.env.API_KEY,
  appTimeZone: process.env.APP_TIMEZONE,
  appLocale: process.env.APP_LOCALE,
  fastifyAddress: process.env.FASTIFY_ADDRESS,
  port: parseInt(process.env.PORT, 10),
  dataBaseUrl: process.env.DATABASE_URL,
  apiJwtToken: process.env.API_JWT_TOKEN,
  apiJwtExpiringHour: parseInt(process.env.API_JWT_EXPIRING_HOUR, 10),
  appFrontEndUrl: process.env.APP_FRONT_END_URL,
  // JWT tokens
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  jwtRefreshTtlDays: parseInt(process.env.JWT_REFRESH_TTL_DAYS ?? '7', 10),
  // Redis
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  redisTtlSeconds: parseInt(process.env.REDIS_TTL_SECONDS ?? '300', 10),
  loginMaxRetries: parseInt(process.env.LOGIN_MAX_RETRIES ?? '5', 10),
  loginLockSeconds: parseInt(process.env.LOGIN_LOCK_SECONDS ?? '300', 10),
  // Elasticsearch
  elasticsearchNode: process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200',
  elasticsearchIndexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX ?? 'caja-logs',
}));
