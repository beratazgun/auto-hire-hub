import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from '@src/core/services/prisma/prisma.service';
import { DriverLicanceService } from './driver-licance.service';
import { DriverLicanceController } from './driver-licance.controller';
import { isThereAnyDriverLicance } from './middlewares/IsThereAnyDriverLicance';
import { ConfigService } from '@nestjs/config';
import { CsrfManagerService } from '@src/core/services/CsrfManager.service';

@Module({
  controllers: [DriverLicanceController],
  providers: [
    PrismaService,
    DriverLicanceService,
    ConfigService,
    CsrfManagerService,
  ],
})
export class DriverLicanceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isThereAnyDriverLicance)
      .forRoutes('api/v1/driver-licance/create');
  }
}
