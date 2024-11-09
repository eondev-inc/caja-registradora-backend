import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { LivenessHealthIndicator } from '../indicators/liveness.indicator';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [LivenessHealthIndicator],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
