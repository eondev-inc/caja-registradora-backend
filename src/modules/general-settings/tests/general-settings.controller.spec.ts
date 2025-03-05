import { Test, TestingModule } from '@nestjs/testing';
import { GeneralSettingsController } from '../general-settings.controller';
import { GeneralSettinsService } from '../general-settings.service';
import { JwtAuthGuard } from '@/commons/guards/jwt-auth.guard';

describe('GeneralSettingsController', () => {
  let controller: GeneralSettingsController;
  let service: GeneralSettinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneralSettingsController],
      providers: [
        {
          provide: GeneralSettinsService,
          useValue: {
            getPaymentMethods: jest.fn().mockReturnValue(['Credit Card', 'PayPal']),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<GeneralSettingsController>(GeneralSettingsController);
    service = module.get<GeneralSettinsService>(GeneralSettinsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return "Hello from general settings" on getGeneralSettings', () => {
    expect(controller.getGeneralSettings()).toBe('Hello from general settings');
  });

  it('should return payment methods on getPaymentMethods', () => {
    expect(controller.getPaymentMethods()).toEqual(['Credit Card', 'PayPal']);
    expect(service.getPaymentMethods).toHaveBeenCalled();
  });
});