import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { PrismaService } from './prisma.service';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { Settings } from 'luxon';
import { AppConfigService } from './config/app/app-config.service';
import { LoggingConfigService } from './config/logging/logging-config.service';
import { LoggingInterceptor } from './commons/interceptors/loggin.interceptor';
import { AppConfig } from './config/app/enums/app-config.enum';
import { APP_URL_PREFIX } from './commons/constants/constants';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HttpExceptionFilter } from './commons/filters/http-exception.filter.';

import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    bodyLimit: 1048576,
  });
  // const app = await NestFactory.create(AppModule)
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );
  //Enable cookie parser
  app.register(fastifyCookie, {
    secret: 'elSecretoDeLaAbuela',
    parseOptions: {},
  });


  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const { httpAdapter } = app.get(HttpAdapterHost);
  const logger = LoggingConfigService.getInstance().getLogger();
  const appConfig: AppConfigService =
    app.get<AppConfigService>(AppConfigService);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  //Prisma Service Setup for avoid bugs on shutting down the API
  //const prismaService: PrismaService = app.get<PrismaService>(PrismaService);
  //await prismaService.enableShutdownHooks(app);

  //Set use global Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  //Set use global Filters
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));

  //Allow class-validator to inject dependencies
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableVersioning({
    type: VersioningType.URI,
  });
  //Enable CORS
  app.enableCors({
    origin: appConfig.get(AppConfig.APP_FRONT_END_URL) ?? 'http://localhost:3000',
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 200,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  // BigInt from DB To String response
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // Set Global url prefix (api/v2)
  app.setGlobalPrefix(APP_URL_PREFIX, {
    exclude: [
      { path: 'api/health', method: RequestMethod.GET },
      { path: 'api/health/liveness', method: RequestMethod.GET },
      { path: 'api/health/readiness', method: RequestMethod.GET },
      { path: '/', method: RequestMethod.GET },
    ],
  });

  if (String(process.env.NODE_ENV).toLowerCase() === 'qa') {
    //Swagger UI for documentation
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Caja Registradora')
      .setDescription('Caja Registradora v1')
      .setVersion('2.0')
      .addBearerAuth()
      .build();

    //Set Swagger Options
    const swaggerOptions: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
      ignoreGlobalPrefix: false,
    };
    //Init Swagger
    const document = SwaggerModule.createDocument(
      app,
      swaggerConfig,
      swaggerOptions,
    );
    SwaggerModule.setup(`${APP_URL_PREFIX}/docs`, app, document, {
      swaggerOptions: {
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  //Define PORT
  const port = appConfig.get(AppConfig.PORT) || 3300;
  const address = appConfig.get(AppConfig.FASTIFY_ADDRESS) || '0.0.0.0';
  Settings.defaultZone = appConfig.get(AppConfig.APP_TIMEZONE);
  Settings.defaultLocale = appConfig.get(AppConfig.APP_LOCALE);

  await app
    .listen(port, address)
    .then(() =>
      logger.log(`[NestApplication] Server starting on port ${port} ...`),
    );
  return { logger, port };
}
bootstrap();
