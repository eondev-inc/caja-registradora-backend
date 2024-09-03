import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ReadinessHealthIndicator extends HealthIndicator {
  private prisma: PrismaService;

  constructor() {
    super();
    this.prisma = new PrismaService();
  }

  async isDbHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$connect();
      const result = this.getStatus('Readiness', true, {
        message: 'Up and running',
      });
      await this.prisma.$disconnect();
      return result;
    } catch (error) {
      console.log(error);
      const result = this.getStatus('Readiness', false, {
        message: 'Database down',
      });
      throw new HealthCheckError('Database connection failed', result);
    }
  }
}
