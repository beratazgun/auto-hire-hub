import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { LoggerService } from '@src/logger/logger.service';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import requestİp from 'request-ip';

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const responseException = exception.getResponse();

    if (responseException['message'][0] instanceof ValidationError) {
      return this.transformValidationErrors(
        responseException,
        response,
        status,
        host,
      );
    } else {
      if (status === 429) {
        return this.toManyRequestErrors(response, host, status);
      } else {
        this.loggerService.infoLevel({
          message: responseException['message'],
          method: host.getArgs()[0].method,
          path: host.getArgs()[0].path,
          headers: host.getArgs()[0].headers,
          statusCode: status,
          ip: requestİp.getClientIp(host.getArgs()[0]),
          userAgent: host.getArgs()[0].headers['user-agent'],
        });

        response.status(status).json({
          isSuccess: false,
          statusCode: status,
          message: responseException['message'],
          status: responseException['error'],
        });
      }
    }
  }

  private toManyRequestErrors(
    response: Response,
    host: ArgumentsHost,
    status: number,
  ) {
    this.loggerService.infoLevel({
      message: 'Too many requests',
      method: host.getArgs()[0].method,
      path: host.getArgs()[0].path,
      headers: host.getArgs()[0].headers,
      statusCode: status,
      ip: requestİp.getClientIp(host.getArgs()[0]),
      userAgent: host.getArgs()[0].headers['user-agent'],
    });

    response.status(status).json({
      isSuccess: false,
      statusCode: status,
      message: 'You have exceeded the request limit.',
      status: 'Too Many Requests',
    });
  }

  private transformValidationErrors(
    responseException: string | object,
    response: Response,
    status: number,
    host: ArgumentsHost,
  ) {
    const validationErrors: {
      [key: string]: string;
    } = {};
    let loggerMessage = 'validation failed: ';

    responseException['message'].map((validationError: ValidationError) => {
      validationErrors[validationError['property']] = Object.values(
        validationError.constraints,
      )[0];
    });
    loggerMessage += Object.values(validationErrors).join(', ');

    this.loggerService.infoLevel({
      message: loggerMessage,
      method: host.getArgs()[0].method,
      path: host.getArgs()[0].path,
      headers: host.getArgs()[0].headers,
      statusCode: status,
      ip: requestİp.getClientIp(host.switchToHttp().getRequest()),
      userAgent: host.getArgs()[0].headers['user-agent'],
    });

    return response.status(status).json({
      isSuccess: false,
      statusCode: status,
      message: 'Validation failed',
      validationErrors,
      status: responseException['error'],
    });
  }
}
