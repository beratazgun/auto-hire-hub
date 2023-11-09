import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document } from 'mongoose';

export type LogDocument = HydratedDocument<Log>;

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({
    type: String,
    required: true,
  })
  message: string;

  @Prop({
    type: String,
    required: true,
  })
  method: string;

  @Prop({
    type: String,
    required: true,
  })
  path: string;

  @Prop({
    type: Object,
    required: true,
  })
  headers: string;

  @Prop({
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
  })
  level: string;

  @Prop({
    type: String,
    required: true,
  })
  userAgent: string;

  @Prop({
    type: String,
    required: true,
  })
  ip: string;

  @Prop({
    type: Number,
    required: true,
  })
  statusCode: number;
}

export const LogSchema = SchemaFactory.createForClass(Log);
