import {
  ConflictException,
  Injectable,
  NestMiddleware,
  UseGuards,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@src/core/services/prisma/prisma.service';
@Injectable()
export class isThereAnyDriverLicance implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const isThereAnyDriverLicance =
      await this.prismaService.driverLicance.findFirst({
        where: {
          renterID: req.session?.user?.id,
        },
      });

    if (isThereAnyDriverLicance) {
      return next(new ConflictException('Driver Licance Already Exists'));
    }
    next();
  }
}
