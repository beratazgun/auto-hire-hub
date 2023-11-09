import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { Log } from './log.schema';

interface LogInterface {
  message: string;
  method: string;
  path: string;
  headers: Object;
  level?: string;
  userAgent: string;
  statusCode: number;
  ip: string;
}

@Injectable()
export class LoggerService {
  constructor(@InjectModel(Log.name) private logModel: Model<Log>) {}

  async infoLevel(fields: Omit<LogInterface, 'level'>): Promise<void> {
    await this.logModel.create({
      message: fields.message,
      method: fields.method,
      path: fields.path,
      headers: fields.headers,
      level: 'info',
      userAgent: fields.userAgent,
      statusCode: fields.statusCode,
      ip: fields.ip,
    });
  }
}
