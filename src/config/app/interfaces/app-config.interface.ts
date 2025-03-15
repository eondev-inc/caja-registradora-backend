export interface AppConfig {
  prismaLogOption: string;
  apiKey: string;
  fastifyAddress: string;
  appLocale: string;
  appTimeZone: string;
  port: number;
  dataBaseUrl: string;
  directUrl: string;
  apiJwtToken: string;
  apiJwtExpiringHour: number;
  supabaseUrl: string;
  supabaseKey: string;
  supabaseJwtSecret: string;
  appFrontEndUrl: string;
}
