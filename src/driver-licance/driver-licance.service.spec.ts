import { Test, TestingModule } from '@nestjs/testing';
import { DriverLicanceService } from './driver-licance.service';

describe('DriverLicanceService', () => {
  let service: DriverLicanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverLicanceService],
    }).compile();

    service = module.get<DriverLicanceService>(DriverLicanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
