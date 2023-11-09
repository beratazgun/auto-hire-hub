import { MiddlewareConsumer, Module } from '@nestjs/common';

import { PrismaService } from '@src/core/services/prisma/prisma.service';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { ConfigService } from '@nestjs/config';
import { CsrfManagerService } from '@src/core/services/CsrfManager.service';

@Module({
  providers: [PrismaService, CarService, ConfigService, CsrfManagerService],
  controllers: [CarController],
})
export class CarModule {}
