import {
  Controller,
  Post,
  Param,
  Req,
  Res,
  Next,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RentCarService } from './rent-car.service';
import { AuthGuard } from '@src/core/guards/Auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import UploadImageManager from '@src/core/libs/UploadImageManager';
import { CarImageMulterFileInterface } from '@src/core/interfaces/CarImageMulterFıle.interface';
import { TerminateBodyDto } from './dtos/TerminateBody.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('rentCar')
@Controller('api/v1/rent-car')
export class RentCarController {
  constructor(private readonly rentCarService: RentCarService) {}

  /**
   * @method rentCar
   */
  @Post('/rent/:carCode')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Rent a car',
    description:
      'Rent a car by carCode and rent type. rent type may be "minute" or "day".',
  })
  rentCar(
    @Query('rentType') rentType: 'minute' | 'day',
    @Param('carCode') carCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.rentCarService.rentCar(rentType, carCode, req, res, next);
  }

  /**
   * @method terminateRent
   */
  @Post('/terminate/:rentalCode')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Terminate a rent',
    description:
      'Terminate a rent by rent id. you should send, To update the current location and fuel rate of the car, you must send the latitude, longitude and fuelLevel values ​​in the body section.  ',
  })
  terminateRent(
    @Body() body: TerminateBodyDto,
    @Param('rentalCode') rentalCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.rentCarService.terminateRent(body, rentalCode, req, res, next);
  }

  /**
   * @method uploadCarStatusImage
   */
  @Post('/car-status/upload-image/:rentalCode')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload car status image',
    description:
      'Upload car status image by rent id. You should send 5 images in the body section. İf you se',
  })
  @ApiBody({
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
  })
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
              req.session.user.renterCode
            }.jpg`;
          },
        ),
      },
    ),
  )
  @UseGuards(AuthGuard)
  uploadCarStatusImage(
    @UploadedFiles() files: CarImageMulterFileInterface,
    @Param('rentalCode') rentalCode: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.rentCarService.uploadCarImage(files, rentalCode, res, next);
  }
}
