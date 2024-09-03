import { Test, TestingModule } from '@nestjs/testing';
import { AuthserverService } from '../authserver.service';

describe('AuthserverService', () => {
  let service: AuthserverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthserverService],
    }).compile();

    service = module.get<AuthserverService>(AuthserverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
