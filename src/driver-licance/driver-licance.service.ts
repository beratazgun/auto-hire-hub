import {
  Req,
  Res,
  Next,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@src/core/services/prisma/prisma.service';
import { omit } from 'lodash';
import UploadImageManager from '@src/core/libs/UploadImageManager';
import DriverLicanceImgAnalyzer from './helpers/DriverLicanceImgAnalyzer';
import { DateManager } from '@src/core/libs/DateManager';
import { sendResponse } from '@src/core/libs/sendResponse';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DriverLicanceService {
  constructor(private prismaService: PrismaService) {}

  /**
   *
   * @param files | frontSide and backSide
   * @param req
   * @param res
   * @param next
   * @description this method will create driver licance. User should be logged in.
   */
  async createDriverLicance(
    files: {
      frontSide: Express.Multer.File[];
      backSide: Express.Multer.File[];
    },
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const driverLicanceImgAnalyzer = new DriverLicanceImgAnalyzer(files);
    const getDriverLicanceData =
      await driverLicanceImgAnalyzer.getRequiredData(); // this will get the required data from the image

    if (
      DateManager.convertYearMonthDayToISO8601(
        getDriverLicanceData.driversLicanseDate,
      ) > DateManager.subtractFromCurrentDate({ year: 1 })
    ) {
      return next(
        new BadRequestException(
          "1 year must pass after you get your driver's license before you can rent a car.",
        ),
      );
    }

    const imageCDNsUrl = {
      frontSide: '',
      backSide: '',
    };

    for (const iterator of Object.keys(imageCDNsUrl)) {
      const response =
        await new UploadImageManager().UploadImageManagerToTheCDN(
          files[iterator][0].path,
          files[iterator][0].filename.slice(0, -4),
          'driver-licance',
        );
      imageCDNsUrl[iterator] = response.secure_url;
    }

    await this.prismaService.driverLicance.create({
      data: {
        ...omit(getDriverLicanceData, [
          'driversLicanseDate',
          'licenceValidityPeriod',
          'bornDate',
        ]),
        driversLicanseDate: DateManager.convertYearMonthDayToISO8601(
          getDriverLicanceData.driversLicanseDate,
        ),
        licenceValidityPeriod: DateManager.convertYearMonthDayToISO8601(
          getDriverLicanceData.licenceValidityPeriod,
        ),
        bornDate: DateManager.convertYearMonthDayToISO8601(
          getDriverLicanceData.bornDate,
        ),
        renterID: req.session.user.id,
        frontSideImage: imageCDNsUrl.frontSide,
        backSideImage: imageCDNsUrl.backSide,
      },
    });

    res.status(200).json({
      message: 'Driver Licance Created',
      statusCode: 200,
      isSuccess: true,
      status: 'success',
    });
  }

  async getDriverLicance(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const driverLicance = await this.prismaService.driverLicance.findFirst({
      where: {
        renterID: req.session.user.id,
      },
    });

    if (!driverLicance) {
      return next(new NotFoundException('Driver Licance Not Found'));
    }

    sendResponse<typeof driverLicance>(
      {
        statusCode: 200,
        isSuccess: true,
        status: 'success',
        result: driverLicance,
      },
      res,
    );
  }

  async deleteDriverLicance(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const driverLicanceId = await this.prismaService.driverLicance.findFirst({
      where: {
        renterID: req.session.user.id,
      },
    });

    if (!driverLicanceId) {
      return next(new NotFoundException('Driver Licance Not Found'));
    }

    await this.prismaService.driverLicance.delete({
      where: {
        id: driverLicanceId.id,
      },
    });

    sendResponse(
      {
        statusCode: 200,
        isSuccess: true,
        status: 'success',
        message: 'Driver Licance Deleted',
      },
      res,
    );
  }
}
