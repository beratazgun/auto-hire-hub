import { Module } from '@nestjs/common';
import { PrismaService } from '@src/core/services/prisma/prisma.service';
import { RentCarService } from './rent-car.service';
import { RentCarController } from './rent-car.controller';
import { ConfigService } from '@nestjs/config';
import { CsrfManagerService } from '@src/core/services/CsrfManager.service';

@Module({
  providers: [PrismaService, RentCarService, ConfigService, CsrfManagerService],
  controllers: [RentCarController],
})
export class RentCarModule {}
