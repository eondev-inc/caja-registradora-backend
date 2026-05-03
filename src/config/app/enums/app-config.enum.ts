export enum AppConfig {
  PRISMA_LOG_OPTION = 'prismaLogOption',
  API_KEY = 'apiKey',
  APP_TIMEZONE = 'appTimeZone',
  APP_LOCALE = 'appLocale',
  FASTIFY_ADDRESS = 'fastifyAddress',
  PORT = 'port',
  DATABASE_URL = 'dataBaseUrl',
  API_JWT_TOKEN = 'apiJwtToken',
  API_JWT_EXPIRING_HOUR = 'apiJwtExpiringHour',
  APP_FRONT_END_URL = 'appFrontEndUrl',
  // JWT
  JWT_ACCESS_EXPIRY = 'jwtAccessExpiry',
  JWT_REFRESH_EXPIRY = 'jwtRefreshExpiry',
  JWT_REFRESH_TTL_DAYS = 'jwtRefreshTtlDays',
  // Redis
  REDIS_HOST = 'redisHost',
  REDIS_PORT = 'redisPort',
  REDIS_TTL_SECONDS = 'redisTtlSeconds',
  LOGIN_MAX_RETRIES = 'loginMaxRetries',
  LOGIN_LOCK_SECONDS = 'loginLockSeconds',
  // Elasticsearch
  ELASTICSEARCH_NODE = 'elasticsearchNode',
  ELASTICSEARCH_INDEX_PREFIX = 'elasticsearchIndexPrefix',
}
