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
}));
