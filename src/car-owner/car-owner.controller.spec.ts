import { Test, TestingModule } from '@nestjs/testing';
import { CarOwnerController } from './car-owner.controller';

describe('CarOwnerController', () => {
  let controller: CarOwnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarOwnerController],
    }).compile();

    controller = module.get<CarOwnerController>(CarOwnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
