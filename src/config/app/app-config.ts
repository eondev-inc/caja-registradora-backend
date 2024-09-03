import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  prismaLogOption: process.env.PRISMA_LOG_OPTION,
  apiKey: process.env.API_KEY,
  appTimeZone: process.env.APP_TIMEZONE,
  appLocale: process.env.APP_LOCALE,
  fastifyAddress: process.env.FASTIFY_ADDRESS,
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  apiJwtToken: process.env.API_JWT_TOKEN,
  urlEmAuthserver: process.env.URL_EM_AUTHSERVER,
  urlBackPerson: process.env.URL_BACK_PERSON,
  urlConversor: process.env.URL_CONVERSOR,
  apiKeyKong: process.env.KONG_APIKEY,
  apiJwtExpiringHour: process.env.API_JWT_EXPIRING_HOUR,
  apiAgenda: process.env.API_AGENDA,
  apiAgendaApiKey: process.env.API_AGENDA_APIKEY,
  apiInitialSettings: process.env.API_INITIAL_SETTINGS,
  apiColdData: process.env.API_EM_BACKEND,
}));
