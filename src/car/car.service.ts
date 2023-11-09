import {
  Req,
  Res,
  Next,
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@src/core/services/prisma/prisma.service';
import { CarImageMulterFileInterface } from '@src/core/interfaces/CarImageMulterFıle.interface';
import {
  GeneratorManager,
  randomIdTypes,
} from '@src/core/libs/GeneratorManager';
import UploadImageManager from '@src/core/libs/UploadImageManager';
import { AddCarDetailsDto, FilterDto, UpdateCarDetailsDto } from './dtos';
import { omit } from 'lodash';
import { Filter } from './helpers/Filter';
import fs from 'fs';
import { sendResponse } from '@src/core/libs/sendResponse';

@Injectable()
export class CarService {
  constructor(private prismaService: PrismaService) {}

  /**
   *
   * @param files
   * @param res
   * @description add car images to the cloudinary cdn
   */
  async addCarImage(files: CarImageMulterFileInterface, @Res() res: Response) {
    const carImagesList: string[] = [];

    for (const iterator of Object.keys(files)) {
      const secureUrl =
        await new UploadImageManager().UploadImageManagerToTheCDN(
          files[iterator][0].path,
          files[iterator][0].filename.slice(0, -4),
          'cars',
        );

      carImagesList.push(secureUrl.secure_url);
    }

    sendResponse(
      {
        message: "Car's images added successfully",
        isSuccess: true,
        status: 'success',
        statusCode: 200,
        result: carImagesList,
      },
      res,
    );
  }

  /**
   *
   * @param body
   * @param req
   * @param res
   * @description add car details to the database
   */
  async addCarDetails(
    @Body() body: AddCarDetailsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const car = await this.prismaService.car.create({
      data: {
        ...omit(body, ['carImages']),
        carCode: GeneratorManager.generateRandomId(24, randomIdTypes.number),
        carOwnerID: req.session.user.id,
      },
    });

    await this.prismaService.carImages.createMany({
      data: body.carImages.map((element) => ({
        carID: car.id,
        image: element,
      })),
    });

    sendResponse(
      {
        message: 'car added successfully',
        isSuccess: true,
        status: 'success',
        statusCode: 200,
      },
      res,
    );
  }

  /**
   *
   * @param noticeId
   * @param res
   * @param next
   * @description get car details from the database
   */
  async getCar(
    noticeId: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const modifiedCarImgList = [];

    const car = await this.prismaService.car.findFirst({
      where: {
        carCode: noticeId,
      },
      include: {
        CarImages: {
          select: {
            image: true,
          },
        },
      },
    });

    if (!car) {
      return next(new NotFoundException('car not found'));
    }

    for (const iterator of car.CarImages) {
      modifiedCarImgList.push(iterator.image);
    }

    const result = {
      ...omit(car, ['CarImages']),
      carImages: modifiedCarImgList,
    };

    sendResponse<typeof result>(
      {
        isSuccess: true,
        status: 'success',
        statusCode: 200,
        result,
      },
      res,
    );
  }

  /**
   *
   * @param carCode
   * @param req
   * @param res
   * @param next
   * @description delete car from the database
   */
  async deleteCar(
    carCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const car = await this.prismaService.car.findUnique({
      where: {
        carCode,
      },
    });

    if (!car) {
      return next(new NotFoundException('car not found'));
    }

    if (car.carOwnerID !== req.session.user.id) {
      return next(new ConflictException('you are not the owner of this car'));
    }

    await this.prismaService.car.update({
      where: {
        carCode,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isPublish: false,
      },
    });

    sendResponse(
      {
        message: 'car deleted successfully',
        isSuccess: true,
        status: 'success',
        statusCode: 200,
      },
      res,
    );
  }

  /**
   *
   * @param carCode
   * @param body
   * @param req
   * @param res
   * @param next
   * @description update car details
   */
  async updateCarDetails(
    carCode: string,
    @Body() body: UpdateCarDetailsDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const car = await this.prismaService.car.findUnique({
      where: {
        carCode,
      },
    });

    if (!car) {
      return next(new NotFoundException('car not found'));
    }

    if (car.carOwnerID !== req.session.user.id) {
      return next(new ConflictException('you are not the owner of this car'));
    }

    await this.prismaService.car.update({
      where: {
        carCode,
      },
      data: {
        ...body,
      },
    });

    sendResponse(
      {
        message: 'car updated successfully',
        isSuccess: true,
        status: 'success',
        statusCode: 200,
      },
      res,
    );
  }

  /**
   *
   * @param query
   * @param req
   * @param res
   * @param next
   * @description get all cars from the database. you can filter, sort, paginate
   */
  async getAllCars(
    query: FilterDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const filter = new Filter(query, next, this.prismaService);
    const filterQueries = filter.modifeQueries();
    const { pagination } = await filter.pagination();

    const docs = await this.prismaService.car.findMany({
      where: {
        AND: [
          omit(filterQueries, ['page', 'limit', 'skip', 'sort']),
          {
            isRentable: true,
          },
        ],
      },
      take: pagination.limit,
      skip: pagination.skip,
      orderBy: {
        ...filterQueries.sort,
      },
    });

    const result = {
      ...pagination,
      length: docs.length,
      docs,
    };

    sendResponse<typeof result>(
      {
        isSuccess: true,
        status: 'success',
        statusCode: 200,
        result,
      },
      res,
    );
  }

  /**
   *
   * @param files
   * @param carCode
   * @param req
   * @param res
   * @param next
   */
  async updateImage(
    files: CarImageMulterFileInterface,
    carCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const uploadedImages = [];

    const carId = await this.prismaService.car.findUnique({
      where: {
        carCode,
      },
    });

    if (!carId) {
      return next(new NotFoundException('car not found'));
    }

    const carImgLength = await this.prismaService.carImages.count({
      where: {
        carID: carId.id,
      },
    });

    if (carImgLength + Object.keys(files).length > 5) {
      Object.values(files).forEach((element) => {
        fs.unlinkSync(element[0].path);
      });

      return next(
        new BadRequestException('you can not add more than 5 images'),
      );
    }

    await Promise.all(
      Object.keys(files).map(async (element) => {
        const data = await new UploadImageManager().UploadImageManagerToTheCDN(
          files[element][0].path,
          files[element][0].filename.slice(0, -4),
          'cars',
        );

        uploadedImages.push(data.secure_url);
      }),
    );

    await this.prismaService.carImages.createMany({
      data: uploadedImages.map((element) => ({
        carID: carId.id,
        image: element,
      })),
    });

    sendResponse(
      {
        message: 'İmages updated.',
        isSuccess: true,
        status: 'success',
        statusCode: 200,
      },
      res,
    );
  }
}
