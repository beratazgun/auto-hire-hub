import {
  ArgumentsHost,
  Catch,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { LoggerService } from '@src/logger/logger.service';
import { Request, Response, NextFunction } from 'express';
import requestİp from 'request-ip';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();

  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const statusCode = res.statusCode;

      if (statusCode === 200) {
        this.loggerService.infoLevel({
          message: res.statusMessage,
          method: req.method,
          path: req.path,
          headers: req.headers,
          statusCode,
          ip: requestİp.getClientIp(req),
          userAgent: req.headers['user-agent'],
        });
      }

      if (statusCode === 401 || statusCode === 404 || statusCode === 405) {
        this.logger.warn(`[${req.method}] ${req.url} - ${statusCode}`);
      }
    });

    next();
  }
}
