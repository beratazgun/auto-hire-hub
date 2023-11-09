import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

interface ErrorMapping {
  status: string;
  statusCode?: number;
  prismaErrorCode?: string;
}

export const errorMappings: Record<string, ErrorMapping> = {
  P2000: {
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'Bad Request',
    prismaErrorCode: 'P2000',
  },
  P2002: {
    statusCode: HttpStatus.CONFLICT,
    status: 'Conflict',
    prismaErrorCode: 'P2002',
  },
  P2003: {
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'bad Request',
    prismaErrorCode: 'P2003',
  },
};

@Catch(PrismaClientKnownRequestError)
export class PrismaClientKnownRequestErrorFilter extends BaseExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorMapping = errorMappings[exception.code];

    if (errorMapping) {
      const { statusCode, status } = errorMapping;
      response.status(statusCode).json({
        statusCode,
        isSuccess: false,
        status,
        message: this.errorMatcher(errorMapping, exception),
      });
    } else {
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      super.catch(exception, host);
    }
  }

  errorMatcher(
    errorMapping: ErrorMapping,
    exception: PrismaClientKnownRequestError,
  ): string {
    const { prismaErrorCode } = errorMapping;

    switch (prismaErrorCode) {
      case 'P2000':
        return `${exception.meta.target[0]} is invalid.`;
      case 'P2002':
        return `${exception.meta.target[0]} already exists.`;
      case 'P2003':
        console.log(exception);
        return `Foreign key constraint failed on the field: ${
          exception.meta.field_name.toString().split('_')[1]
        }`;
      default:
        return 'Something went wrong.';
    }
  }
}
