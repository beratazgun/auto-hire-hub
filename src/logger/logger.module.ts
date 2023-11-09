import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './log.schema';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
  imports: [
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
    LoggerModule,
  ],
})
export class LoggerModule {}
