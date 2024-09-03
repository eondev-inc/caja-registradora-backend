import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { LivenessHealthIndicator } from './indicators/liveness.indicator';
import { ReadinessHealthIndicator } from './indicators/readiness.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [LivenessHealthIndicator, ReadinessHealthIndicator],
})
export class HealthModule {}
