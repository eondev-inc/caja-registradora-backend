export interface AppConfig {
  prismaLogOption: string;
  apiKey: string;
  appTimeZone: string;
  appLocale: string;
  fastifyAddress: string;
  port: number;
  dataBaseUrl: string;
  apiJwtToken: string;
  apiJwtExpiringHour: number;
  appFrontEndUrl: string;
}
