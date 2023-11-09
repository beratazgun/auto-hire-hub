import { Test, TestingModule } from '@nestjs/testing';
import { RentCarService } from './rent-car.service';

describe('RentCarService', () => {
  let service: RentCarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RentCarService],
    }).compile();

    service = module.get<RentCarService>(RentCarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
