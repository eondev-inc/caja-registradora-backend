import { Test, TestingModule } from '@nestjs/testing';
import { OpenRegisterController } from '../open-register.controller';

describe('OpenRegisterController', () => {
  let controller: OpenRegisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenRegisterController],
    }).compile();

    controller = module.get<OpenRegisterController>(OpenRegisterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
