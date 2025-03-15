import {
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  InternalServerErrorException,
  NotAcceptableException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { BaseExceptionFilter } from '@nestjs/core';
import { LoggingConfigService } from '@/config/logging/logging-config.service';
import { v4 as uuidv4 } from 'uuid';
import { HttpError } from './http-exception.interface';

@Catch(
  HttpException,
  NotFoundException,
  InternalServerErrorException,
  NotAcceptableException,
  BadRequestException,
)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = LoggingConfigService.getInstance().getLogger();
  async catch(
    exception:
      | HttpException
      | NotFoundException
      | InternalServerErrorException
      | NotAcceptableException
      | BadRequestException
      | ConflictException,
    host: ArgumentsHost,
  ): Promise<void> {
    const httpContext = host.switchToHttp();
    const res = httpContext.getResponse<FastifyReply>();
    const req = httpContext.getRequest<FastifyRequest>();
    const status = exception.getStatus();
    const message = exception.getResponse();

    const errorBody: HttpError = {
      statusCode: message['status'] || status,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.url,
      message: message['message'] || null,
      error: message['error'] || null,
      trace_id: uuidv4(),
    };

    this.logger.error('[Error Body]', errorBody);

    res.status(message['status'] || status).send(errorBody);
  }
}
