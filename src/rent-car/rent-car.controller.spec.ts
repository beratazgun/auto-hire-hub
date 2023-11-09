import { Test, TestingModule } from '@nestjs/testing';
import { RentCarController } from './rent-car.controller';

describe('RentCarController', () => {
  let controller: RentCarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentCarController],
    }).compile();

    controller = module.get<RentCarController>(RentCarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
