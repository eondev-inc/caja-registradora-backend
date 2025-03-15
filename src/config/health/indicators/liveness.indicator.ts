import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class LivenessHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = true;
    const result = this.getStatus(key, isHealthy, {
      message: 'Up and running',
    });

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Health failed', result);
  }
}
