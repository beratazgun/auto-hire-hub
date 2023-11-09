import { Test, TestingModule } from '@nestjs/testing';
import { RenterController } from './renter.controller';

describe('RenterController', () => {
  let controller: RenterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RenterController],
    }).compile();

    controller = module.get<RenterController>(RenterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
