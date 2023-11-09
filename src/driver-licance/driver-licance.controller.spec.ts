import { Test, TestingModule } from '@nestjs/testing';
import { DriverLicanceController } from './driver-licance.controller';

describe('DriverLicanceController', () => {
  let controller: DriverLicanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverLicanceController],
    }).compile();

    controller = module.get<DriverLicanceController>(DriverLicanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
