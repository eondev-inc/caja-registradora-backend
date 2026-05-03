import { Injectable, LoggerService } from '@nestjs/common';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';

// winston-elasticsearch usa require ya que no tiene typings ESM completos
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ElasticsearchTransport } = require('winston-elasticsearch');

@Injectable()
export class LoggingConfigService {
  private transports: any;
  private readonly options: winston.LoggerOptions;
  private _logger: winston.Logger;

  private static _instance: LoggingConfigService;

  /**
   * Private constructor to initialize logging transports and options.
   */
  private constructor() {
    const esNode =
      process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200';
    const indexPrefix =
      process.env.ELASTICSEARCH_INDEX_PREFIX ?? 'caja-logs';

    const esTransport = new ElasticsearchTransport({
      level: 'info',
      indexPrefix,
      indexSuffixPattern: 'YYYY.MM.DD',
      clientOpts: {
        node: esNode,
        maxRetries: 3,
        requestTimeout: 10000,
      },
      // Mapeo mínimo para que Kibana entienda el timestamp
      transformer: (logData: any) => {
        return {
          '@timestamp': new Date().toISOString(),
          severity: logData.level,
          message: logData.message,
          context: logData.meta?.context ?? '',
          traceId: logData.meta?.traceId ?? '',
          fields: logData.meta,
        };
      },
    });

    esTransport.on('error', (error: Error) => {
      // Evitar que un error de ES derribe la app
      console.error('Elasticsearch transport error:', error.message);
    });

    this.transports = {
      console: new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike(),
        ),
      }),
      file: new winston.transports.File({
        filename: 'errors.log',
        level: 'error',
      }),
      elasticsearch: esTransport,
    };

    this._logger = winston.createLogger({
      levels: winston.config.npm.levels,
      transports: [
        this.transports.console,
        this.transports.elasticsearch,
      ],
    });

    if (process.env.NODE_ENV === 'production') {
      this._logger.add(this.transports.file);
    }
  }

  /**
   * Returns the singleton instance of LoggingConfigService.
   * @returns {LoggingConfigService} The singleton instance.
   */
  public static getInstance(): LoggingConfigService {
    if (!this._instance) {
      this._instance = new LoggingConfigService();
    }
    return this._instance;
  }

  /**
   * Returns the logger instance.
   * @returns {LoggerService} The logger instance.
   */
  getLogger(): LoggerService {
    return WinstonModule.createLogger(this._logger);
  }

  /**
   * Returns the raw winston logger for direct use with metadata (traceId, etc.).
   * @returns {winston.Logger} The raw winston logger.
   */
  getRawLogger(): winston.Logger {
    return this._logger;
  }
}
