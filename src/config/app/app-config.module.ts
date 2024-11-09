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
        DIRECT_URL: Joi.string().required(),
        API_JWT_TOKEN: Joi.string().required(),
        API_JWT_EXPIRING_HOUR: Joi.number().required(),
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_KEY: Joi.string().required(),
        SUPABASE_JWT_SECRET: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
