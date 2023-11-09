import { Test, TestingModule } from '@nestjs/testing';
import { CarOwnerService } from './car-owner.service';

describe('CarOwnerService', () => {
  let service: CarOwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarOwnerService],
    }).compile();

    service = module.get<CarOwnerService>(CarOwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
