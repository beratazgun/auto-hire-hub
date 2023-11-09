import {
  Req,
  Res,
  Next,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@src/core/services/prisma/prisma.service';
import { NextFunction, Request, Response } from 'express';
import {
  GeneratorManager,
  randomIdTypes,
} from '@src/core/libs/GeneratorManager';
import { DateManager } from '@src/core/libs/DateManager';
import { CarImageMulterFileInterface } from '@src/core/interfaces/CarImageMulterFıle.interface';
import UploadImageManager from '@src/core/libs/UploadImageManager';
import { TerminateBodyDto } from './dtos/TerminateBody.dto';
import { sendResponse } from '@src/core/libs/sendResponse';
import EmailManager from '@src/core/libs/EmailManager';
import { RentalStatusInterface } from '@src/core/interfaces/email-interfaces/RentalStatus.interface';

@Injectable()
export class RentCarService {
  constructor(private prismaService: PrismaService) {}

  /**
   * @param rentType
   * @param carCode
   * @param req
   * @param res
   * @param next
   * @description Renter can rent car with this method
   */
  async rentCar(
    rentType: string,
    carCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const isRentable = await this.prismaService.car.findUnique({
      where: {
        carCode,
        isRentable: true,
      },
    });

    if (!isRentable) {
      return next(new BadRequestException('Car is not rentable'));
    }

    const chechDriverLicance = await this.prismaService.driverLicance.findFirst(
      {
        where: {
          renterID: req.session.user.id,
        },
      },
    );

    if (!chechDriverLicance) {
      return next(
        new BadRequestException('You should add your driver licance'),
      );
    }

    await this.prismaService.rentalStatus.create({
      data: {
        rentalCode: GeneratorManager.generateRandomId(16, randomIdTypes.number),
        renterID: req.session.user.id,
        carID: isRentable.id,
        endingDate:
          rentType === 'day'
            ? DateManager.addFromCurrentDate({ day: 1 })
            : null,
        totalFee: rentType === 'day' ? isRentable.pricePerDay : null,
      },
    });

    await this.prismaService.car.update({
      where: {
        id: isRentable.id,
      },
      data: {
        isRentable: false,
      },
    });

    sendResponse(
      {
        isSuccess: true,
        status: 'success',
        statusCode: 200,
        message: 'You rented car successfully. ',
      },
      res,
    );
  }

  /**
   * @param body
   * @param rentalCode
   * @param req
   * @param res
   * @param next
   * @description Renter can terminate rent with this method. Before this endpoint, renter should upload car's images.
   */
  async terminateRent(
    body: TerminateBodyDto,
    rentalCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const rentalStatus = await this.prismaService.rentalStatus.findFirst({
      where: {
        rentalCode,
      },
      include: {
        Car: true,
      },
    });

    if (!rentalStatus) {
      return next(
        new BadRequestException('Wrong car code. We cannot find it.'),
      );
    }

    if (rentalStatus.renterID !== req.session.user.id) {
      return next(
        new BadRequestException(
          'You cannot terminate this rent. This rent is not yours.',
        ),
      );
    }

    if (
      rentalStatus.endingDate !== null &&
      DateManager.subtractFromCurrentDate({ day: 1 }) < rentalStatus.endingDate
    ) {
      return next(
        new BadRequestException(
          'You cannot terminate this rent. You should terminate it before 24 hours.',
        ),
      );
    }

    if (!rentalStatus.isImagesUploaded) {
      return next(
        new BadRequestException(
          "You cannot terminate this rent. you have to upload car's image first",
        ),
      );
    }

    const rentType = rentalStatus.endingDate;
    const totalFee =
      DateManager.calculateDifferenceBetweenDates(
        rentalStatus.startingDate,
        new Date(),
        'minute',
      ) * rentalStatus.Car.pricePerMin;

    const updateRentalStatus = await this.prismaService.rentalStatus.update({
      where: {
        id: rentalStatus.id,
      },
      data: {
        rentStatus: 'terminated',
        paymentStatus: 'paid',
        endingDate: rentType ? null : new Date(),
        totalFee: rentType ? null : totalFee,
      },
    });

    const car = await this.prismaService.car.update({
      where: {
        id: updateRentalStatus.carID,
      },
      data: {
        isRentable: true,
        latitude: body.latitude,
        longitude: body.longitude,
        fuelLevel: body.fuelLevel,
      },
    });

    new EmailManager().sendEmail<RentalStatusInterface>({
      to: req.session.user.email,
      subject: 'Rent Summary',
      template: 'rentalSummary',
      data: {
        firstName: req.session.user.firstName,
        brand: car.brand,
        model: car.model,
        plateNumber: car.plateNumber,
        totalDuration: DateManager.calculateDifferenceBetweenDates(
          new Date(rentalStatus.startingDate),
          rentalStatus.endingDate === null
            ? new Date(Date.now())
            : new Date(rentalStatus.endingDate),
          'minute',
        ),
        totalFee: updateRentalStatus.totalFee,
      },
    });

    sendResponse(
      {
        isSuccess: true,
        status: 'success',
        statusCode: 200,
        message: 'You terminated rent successfully. ',
      },
      res,
    );
  }

  /**
   * @param files
   * @param rentalCode
   * @param res
   * @param next
   * @description Renter can upload car's images with this method.
   */
  async uploadCarImage(
    files: CarImageMulterFileInterface,
    rentalCode: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const imagesSecureUrls = [];

    if (Object.keys(files).length !== 5) {
      return next(
        new BadRequestException(
          'You should send 5 images. frontSide, backSide, rightSide, leftSide, inside',
        ),
      );
    }

    const getCarId = await this.prismaService.rentalStatus.findFirst({
      where: {
        rentalCode,
      },
    });

    if (!getCarId) {
      return next(
        new BadRequestException('Wrong rental code. We cannot find it.'),
      );
    }

    await this.prismaService.carImages.deleteMany({
      where: {
        carID: getCarId.carID,
      },
    });

    await Promise.all(
      Object.keys(files).map(async (element) => {
        const data = await new UploadImageManager().UploadImageManagerToTheCDN(
          files[element][0].path,
          files[element][0].filename.slice(0, -4),
          'cars',
        );

        imagesSecureUrls.push(data.secure_url);
      }),
    );

    await this.prismaService.carImages.createMany({
      data: imagesSecureUrls.map((element) => ({
        carID: getCarId.carID,
        image: element,
      })),
    });

    await this.prismaService.rentalStatus.update({
      where: {
        id: getCarId.id,
      },
      data: {
        isImagesUploaded: true,
      },
    });

    sendResponse<typeof imagesSecureUrls>(
      {
        isSuccess: true,
        status: 'success',
        statusCode: 200,
        message: 'You uploaded car images successfully. ',
        result: imagesSecureUrls,
      },
      res,
    );
  }
}
