import {
  Controller,
  Post,
  Req,
  Res,
  Next,
  Get,
  UseInterceptors,
  UploadedFiles,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CarService } from './car.service';
import { Request, Response, NextFunction } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import UploadImageManager from '@src/core/libs/UploadImageManager';
import { UpdateCarDetailsDto, AddCarDetailsDto, FilterDto } from './dtos';
import { AuthGuard } from '@src/core/guards/Auth.guard';
import { IsCarOwnerAuthorizationGuard } from '@src/core/guards/IsCarOwnerAuthorization.guard';
import { CarImageMulterFileInterface } from '@src/core/interfaces/CarImageMulterFıle.interface';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

const ImageUploadSwaggerApiBody = {
  schema: {
    type: 'object',
    properties: {
      frontSide: {
        type: 'string',
        format: 'binary',
      },
      backSide: {
        type: 'string',
        format: 'binary',
      },
      rightSide: {
        type: 'string',
        format: 'binary',
      },
      leftSide: {
        type: 'string',
        format: 'binary',
      },
      inside: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};

@ApiTags('car')
@Controller('/api/v1/car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  /**
   * @method addCarsImage
   */
  @Post('/add/image')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontSide', maxCount: 1 },
        { name: 'backSide', maxCount: 1 },
        { name: 'rightSide', maxCount: 1 },
        { name: 'leftSide', maxCount: 1 },
        { name: 'inside', maxCount: 1 },
      ],
      {
        storage: UploadImageManager.multerStorage(
          (req: Request, file: Express.Multer.File) => {
            return `${file.originalname.split('.')[0]}--${
              req.session.user.carOwnerCode
            }.jpg`;
          },
        ),
      },
    ),
  )
  @ApiOperation({
    summary: 'Add car images to cloudinary CDN. ',
    description:
      "This endpoint will add car images to cloudinary CDN and return the image url. İt will not save to the database. from now on you should use these image urls in this endpoint:'/add/car-details'",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(ImageUploadSwaggerApiBody)
  @UseGuards(AuthGuard, IsCarOwnerAuthorizationGuard)
  addCarsImage(
    @UploadedFiles()
    files: CarImageMulterFileInterface,
    @Res() res: Response,
  ) {
    this.carService.addCarImage(files, res);
  }

  /**
   * @method addCarDetails
   */
  @Post('/add/car-details')
  @UseGuards(AuthGuard, IsCarOwnerAuthorizationGuard)
  @ApiOperation({
    summary: 'Add car details to database.',
  })
  addCarDetails(
    @Body() body: AddCarDetailsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.carService.addCarDetails(body, req, res);
  }

  /**
   * @method getCar
   */
  @Get('/get/:carCode')
  @ApiOperation({
    summary: 'Get car details by carCode.',
  })
  getCar(
    @Param('carCode') carCode: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.carService.getCar(carCode, res, next);
  }

  /**
   * @method deleteCar
   */
  @Post('/delete/:carCode')
  @UseGuards(AuthGuard, IsCarOwnerAuthorizationGuard)
  @ApiOperation({
    summary: 'Delete car by carCode.',
  })
  deleteCar(
    @Param('carCode') carCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.carService.deleteCar(carCode, req, res, next);
  }

  /**
   * @method updateCarDetails
   */
  @Post('/update/:carCode')
  @ApiOperation({
    summary: 'Update car details by carCode.',
  })
  @UseGuards(AuthGuard, IsCarOwnerAuthorizationGuard)
  updateCarDetails(
    @Param('carCode') carCode: string,
    @Body() body: UpdateCarDetailsDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.carService.updateCarDetails(carCode, body, req, res, next);
  }

  /**
   * @method updateImage
   */
  @Post('/update/image/:carCode')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontSide', maxCount: 1 },
        { name: 'backSide', maxCount: 1 },
        { name: 'rightSide', maxCount: 1 },
        { name: 'leftSide', maxCount: 1 },
        { name: 'inside', maxCount: 1 },
      ],
      {
        storage: UploadImageManager.multerStorage(
          (req: Request, file: Express.Multer.File) => {
            return `${file.originalname.split('.')[0]}--${
              req.session.user.carOwnerCode
            }.jpg`;
          },
        ),
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody(ImageUploadSwaggerApiBody)
  @UseGuards(AuthGuard, IsCarOwnerAuthorizationGuard)
  @ApiOperation({
    summary: 'Update car images by carCode.',
  })
  updateImage(
    @UploadedFiles()
    files: CarImageMulterFileInterface,
    @Param('carCode') carCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.carService.updateImage(files, carCode, req, res, next);
  }

  /**
   * @method getAllCars
   */
  @Get('/get-all')
  @ApiOperation({
    summary: 'Get all cars.',
  })
  async getAllCars(
    @Query() query: FilterDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.carService.getAllCars(query, req, res, next);
  }
}
