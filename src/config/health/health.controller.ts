import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

import { Public } from '../../commons/decorators/public.decorator';
import { LivenessHealthIndicator } from './indicators/liveness.indicator';
import { ReadinessHealthIndicator } from './indicators/readiness.indicator';

@Controller('api/health')
@ApiTags('healthcheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private livenessHealthIndicator: LivenessHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private readinessIndicator: ReadinessHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> =>
        this.livenessHealthIndicator.isHealthy('health'),
    ]);
  }

  @Public()
  @Get('liveness')
  @HealthCheck()
  checkMemory(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.memoryHealthIndicator.checkRSS('memory_heap', 1024 * 1024 * 1024),
    ]);
  }

  @Public()
  @Get('readiness')
  @HealthCheck()
  async readiness() {
    return this.readinessIndicator.isDbHealthy();
  }
}
