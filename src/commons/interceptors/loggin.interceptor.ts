import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { APP_URL_PREFIX } from '../constants/constants';
import { LoggingConfigService } from '@/config/logging/logging-config.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly rawLogger = LoggingConfigService.getInstance().getRawLogger();

  constructor(@Inject(Logger) private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    if (!req) {
      return next.handle();
    }

    const url: string = req.url;
    const healthUrl = `${APP_URL_PREFIX}/health`;

    // Generar un traceId único por request y adjuntarlo a la request
    const traceId: string = uuidv4();
    req.traceId = traceId;

    // Propagar el traceId como response header para debugging desde el cliente
    const res = context.switchToHttp().getResponse();
    if (res?.header) {
      res.header('X-Trace-Id', traceId);
    } else if (res?.raw?.setHeader) {
      // Fastify raw response
      res.raw.setHeader('X-Trace-Id', traceId);
    }

    if (!url.startsWith(healthUrl)) {
      this.rawLogger.info(`${context.getHandler().name} [${req.method} ${url}] - INIT`, {
        context: context.getClass().name,
        traceId,
        method: req.method,
        url,
      });
    }

    return next.handle().pipe(
      tap({
        next: () => {
          if (!url.startsWith(healthUrl)) {
            const elapsed = Date.now() - now;
            this.rawLogger.info(
              `${context.getHandler().name} [${req.method} ${url}] - END ${elapsed}ms`,
              {
                context: context.getClass().name,
                traceId,
                method: req.method,
                url,
                durationMs: elapsed,
              },
            );
          }
        },
        error: (error: Error) => {
          const elapsed = Date.now() - now;
          this.rawLogger.error(
            `${context.getHandler().name} [${req.method} ${url}] - ERROR ${elapsed}ms`,
            {
              context: context.getClass().name,
              traceId,
              method: req.method,
              url,
              durationMs: elapsed,
              errorMessage: error.message,
            },
          );
        },
      }),
    );
  }
}
