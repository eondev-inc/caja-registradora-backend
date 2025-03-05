import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { GeneralSettinsService } from '../general-settings.service';
import { payment_method } from '@prisma/client';

describe('GeneralSettingsService', () => {
  let service: GeneralSettinsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralSettinsService,
        {
          provide: PrismaService,
          useValue: {
            payment_method: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GeneralSettinsService>(GeneralSettinsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPaymentMethods', () => {
    it('should return an array of payment methods', async () => {
      const mockPaymentMethods: payment_method[] = [
        { id: 'abc', method_name: 'CREDIT_CARD', description: 'Credit Card', status: true, created_at: new Date(), updated_at: new Date() },
        { id: 'def', method_name: 'PAYPAL', description: 'PayPal', status: true, created_at: new Date(), updated_at: new Date() },
        { id: 'ghi', method_name: 'CASH', description: 'Cash', status: true, created_at: new Date(), updated_at: new Date() },
        { id: 'jkl', method_name: 'BANK_TRANSFER', description: 'Bank Transfer', status: true, created_at: new Date(), updated_at: new Date() },
      ];
      jest.spyOn(prismaService.payment_method, 'findMany').mockResolvedValue(mockPaymentMethods);

      const result = await service.getPaymentMethods();
      expect(result).toEqual(mockPaymentMethods);
    });
  });
});