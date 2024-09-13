import { Module } from '@nestjs/common';
import { OpenRegisterController } from './open-register.controller';
import { OpenRegisterService } from './open-register.service';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  imports: [PrismaModule],
  controllers: [OpenRegisterController],
  providers: [OpenRegisterService],
})
export class OpenRegisterModule {}
