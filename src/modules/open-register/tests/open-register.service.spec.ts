import { Test, TestingModule } from '@nestjs/testing';
import { OpenRegisterService } from '../open-register.service';

describe('OpenRegisterService', () => {
  let service: OpenRegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRegisterService],
    }).compile();

    service = module.get<OpenRegisterService>(OpenRegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
