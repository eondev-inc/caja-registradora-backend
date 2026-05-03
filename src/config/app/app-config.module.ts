import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import appConfig from './app-config';
import { AppConfigService } from './app-config.service';

/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      expandVariables: true,
      load: [appConfig],
      validationSchema: Joi.object({
        PRISMA_LOG_OPTION: Joi.string().required(),
        API_KEY: Joi.string().required(),
        APP_TIMEZONE: Joi.string().required(),
        APP_LOCALE: Joi.string().required(),
        FASTIFY_ADDRESS: Joi.string().required(),
        PORT: Joi.number().required(),
        DATABASE_URL: Joi.string().required(),
        API_JWT_TOKEN: Joi.string().required(),
        API_JWT_EXPIRING_HOUR: Joi.number().required(),
        APP_FRONT_END_URL: Joi.string().required(),
        // JWT tokens (opcionales con defaults seguros)
        JWT_ACCESS_EXPIRY: Joi.string().required(),
        JWT_REFRESH_EXPIRY: Joi.string().required(),
        JWT_REFRESH_TTL_DAYS: Joi.number().integer().min(1).required(),
        // Redis (opcionales con defaults)
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_TTL_SECONDS: Joi.number().required(),
        LOGIN_MAX_RETRIES: Joi.number().required(),
        LOGIN_LOCK_SECONDS: Joi.number().required(),
        // Elasticsearch (opcionales con defaults)
        ELASTICSEARCH_NODE: Joi.string().required(),
        ELASTICSEARCH_INDEX_PREFIX: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
