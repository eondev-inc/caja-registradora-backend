import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { FastifyReply } from 'fastify';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  get(@Res() reply: FastifyReply) {
    reply.code(HttpStatus.OK).send('Hello World!');
  }
}
