import { Module } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientValidationErrorFilter } from './core/filters/PrismaClientValidationError.filter';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './logger/log.schema';
import { ConfigService } from '@nestjs/config';
import { RenterService } from './renter/renter.service';
import { RenterController } from './renter/renter.controller';
import { RenterModule } from './renter/renter.module';
import { PrismaService } from './core/services/prisma/prisma.service';
import { CsrfManagerService } from './core/services/CsrfManager.service';
import { OtpManagerService } from './core/services/OtpManager.service';
import { CarOwnerService } from './car-owner/car-owner.service';
import { CarOwnerController } from './car-owner/car-owner.controller';
import { CarOwnerModule } from './car-owner/car-owner.module';
import { DriverLicanceService } from './driver-licance/driver-licance.service';
import { DriverLicanceController } from './driver-licance/driver-licance.controller';
import { DriverLicanceModule } from './driver-licance/driver-licance.module';
import { CarService } from './car/car.service';
import { CarController } from './car/car.controller';
import { CarModule } from './car/car.module';
import { RentCarService } from './rent-car/rent-car.service';
import { RentCarController } from './rent-car/rent-car.controller';
import { RentCarModule } from './rent-car/rent-car.module';
import { PrismaClientKnownRequestErrorFilter } from './core/filters/PrismaClientKnownRequestError.filter';

const configService = new ConfigService();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    MongooseModule.forRoot(configService.get<string>('MONGODB_URL'), {
      dbName: 'auto-hire-hub-log',
    }),
    MongooseModule.forFeature([{ name: 'Log', schema: LogSchema }]),
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
    RenterModule,
    CarOwnerModule,
    DriverLicanceModule,
    CarModule,
    RentCarModule,
  ],
  controllers: [
    RenterController,
    CarOwnerController,
    DriverLicanceController,
    CarController,
    RentCarController,
  ],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: PrismaClientKnownRequestErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientValidationErrorFilter,
    },
    RenterService,
    PrismaService,
    CsrfManagerService,
    OtpManagerService,
    CarOwnerService,
    DriverLicanceService,
    CarService,
    RentCarService,
  ],
})
export class AppModule {}
