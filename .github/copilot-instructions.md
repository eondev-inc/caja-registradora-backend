# COPILOT GUIDELINES - NestJS + PrismaORM Backend

## PRIME DIRECTIVE
- Focus on one file at a time to prevent conflicts
- Explain your approach while coding
- Always maintain project architecture patterns

## PROJECT CONTEXT
- **Framework**: NestJS (v11.1.2)
- **Database**: PostgreSQL with PrismaORM (v6.9.0) 
- **Target**: ES2021, CommonJS modules
- **Architecture**: Modular structure with guards, interceptors, decorators
- **Authentication**: JWT with Passport
- **Platform**: Fastify (primary), Express (fallback)

## NESTJS ARCHITECTURE PATTERNS

### Module Structure
```typescript
// Follow existing pattern: src/modules/[feature]/
├── dto/           // Data Transfer Objects
├── entities/      // Prisma model exports
├── guards/        // Feature-specific guards
├── [feature].controller.ts
├── [feature].service.ts  
├── [feature].module.ts
```

### Core Principles
- Use dependency injection with `@Injectable()`
- Implement proper DTOs with validation decorators
- Follow controller → service → repository pattern
- Leverage existing guards in `src/commons/guards/`
- Use interceptors from `src/commons/interceptors/`

## PRISMA REQUIREMENTS

### Schema Guidelines
- Follow existing naming: snake_case for database, camelCase for generated client
- Use UUID primary keys: `@id @default(dbgenerated("gen_random_uuid()")) @db.Uuid`
- Implement proper relationships with foreign keys
- Use enums for status fields
- Include timestamps: `created_at`, `updated_at`

### Service Layer Best Practices
```typescript
// Inject PrismaService, use transactions for complex operations
async updateWithTransaction(data: UpdateDto) {
  return this.prisma.$transaction(async (prisma) => {
    // Multiple operations
  });
}

// Use proper error handling with Prisma exceptions
try {
  return await this.prisma.model.create({ data });
} catch (error) {
  if (error.code === 'P2002') {
    throw new ConflictException('Duplicate constraint violation');
  }
  throw error;
}
```

## TYPESCRIPT REQUIREMENTS

### Modern Features (ES2021+)
- Use decorators: `@Injectable()`, `@Controller()`, `@Get()`, etc.
- Leverage optional chaining (`?.`) and nullish coalescing (`??`)
- Use `const` and `let`, avoid `var`
- Implement proper typing with interfaces and types
- Use async/await over promises chains

### Validation & DTOs
```typescript
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
```

## ERROR HANDLING

### NestJS Exception Filters
- Use built-in exceptions: `BadRequestException`, `NotFoundException`, etc.
- Implement global exception filters for Prisma errors
- Log errors properly using NestJS Logger
- Return consistent error responses

### Database Error Mapping
```typescript
// Map Prisma errors to HTTP exceptions
switch (error.code) {
  case 'P2002': throw new ConflictException('Unique constraint failed');
  case 'P2025': throw new NotFoundException('Record not found');
  case 'P2003': throw new BadRequestException('Foreign key constraint failed');
}
```

## AUTHENTICATION & SECURITY

### JWT Implementation
- Use existing auth guards: `@UseGuards(JwtAuthGuard)`
- Implement role-based access: `@Roles('admin', 'user')`
- Secure sensitive endpoints with proper decorators
- Hash passwords with bcrypt (existing dependency)

### Request Validation
- Use `ValidationPipe` globally
- Implement custom validators when needed
- Sanitize inputs through DTOs
- Use Swagger decorators for API documentation

## TESTING PATTERNS

### Unit Tests
- Mock PrismaService in tests
- Test service methods independently
- Use Jest testing framework (configured)
- Follow AAA pattern (Arrange, Act, Assert)

### Integration Tests
- Test complete request flows
- Use test database with Prisma
- Test authentication and authorization
- Validate proper error responses

## PERFORMANCE & MONITORING

### Database Optimization
- Use Prisma's `include` and `select` strategically
- Implement pagination for list endpoints
- Use database indexes appropriately
- Monitor query performance with Prisma logs

### Caching Strategy
- Implement Redis caching for frequent queries
- Use NestJS cache interceptors
- Cache configuration data and user sessions

## DOCUMENTATION REQUIREMENTS

### Code Documentation
```typescript
/**
 * Creates a new transaction record
 * @param createDto - Transaction creation data
 * @param userId - ID of the authenticated user
 * @returns Promise<Transaction> Created transaction
 * @throws BadRequestException When validation fails
 */
async create(createDto: CreateTransactionDto, userId: string): Promise<Transaction>
```

### API Documentation
- Use Swagger decorators consistently
- Document all endpoints with `@ApiOperation()`
- Provide example responses with `@ApiResponse()`
- Document authentication requirements

## DEPLOYMENT CONSIDERATIONS

### Docker Integration
- Follow existing Dockerfile patterns
- Use multi-stage builds for optimization
- Properly handle environment variables
- Include health checks with `@nestjs/terminus`

### Environment Configuration
- Use `@nestjs/config` for environment management
- Validate configuration with Joi schemas
- Separate configs by feature in `src/config/`
- Use proper typing for configuration objects

## FORBIDDEN PRACTICES

### Avoid These Patterns
- Direct database queries bypassing Prisma
- Mixing business logic in controllers
- Exposing Prisma models directly in APIs
- Hardcoding configuration values
- Using `any` type excessively
- Ignoring validation on DTOs
- Missing error handling in async operations

### Security Don'ts
- Never expose internal error messages to clients
- Don't log sensitive information
- Avoid raw SQL unless absolutely necessary
- Don't bypass authentication on protected routes
- Never commit secrets to version control