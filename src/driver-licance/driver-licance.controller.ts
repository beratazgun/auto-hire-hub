import {
  Controller,
  Post,
  Req,
  Res,
  Next,
  Get,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { DriverLicanceService } from './driver-licance.service';
import { Request, Response, NextFunction } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import UploadImageManager from '@src/core/libs/UploadImageManager';
import { AuthGuard } from '@src/core/guards/Auth.guard';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsRenterAuthorizationGuard } from '@src/core/guards/IsRenterAuthorization.guard';

@ApiTags('driverLicance')
@Controller('/api/v1/driver-licance')
export class DriverLicanceController {
  constructor(private readonly driverLicanceService: DriverLicanceService) {}

  /**
   *
   * @method CreateDriverLicance
   */
  @Post('/create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontSide', maxCount: 1 },
        { name: 'backSide', maxCount: 1 },
      ],
      {
        storage: UploadImageManager.multerStorage(
          (req: Request, file: Express.Multer.File) => {
            return `${file.originalname.split('.')[0]}-driverlicance--${
              req.session.user.renterCode
            }.jpg`;
          },
        ),
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
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
      },
    },
  })
  @UseGuards(AuthGuard, IsRenterAuthorizationGuard)
  @ApiOperation({
    summary: 'Create driver licance.',
    description:
      'You should use Turkish driver licance. İf you use another country driver licance, İt will not work.',
  })
  createDriverLicance(
    @UploadedFiles()
    files: {
      frontSide: Express.Multer.File[];
      backSide: Express.Multer.File[];
    },
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.driverLicanceService.createDriverLicance(files, req, res, next);
  }

  /**
   * @method GetDriverLicance
   */
  @Get('/me/get')
  @UseGuards(AuthGuard, IsRenterAuthorizationGuard)
  @ApiOperation({
    summary: 'Get driver licance.',
  })
  getDriverLicance(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.driverLicanceService.getDriverLicance(req, res, next);
  }

  @Post('/me/delete')
  @UseGuards(AuthGuard, IsRenterAuthorizationGuard)
  @ApiOperation({
    summary: 'Delete driver licance.',
  })
  deleteDriverLicance(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.driverLicanceService.deleteDriverLicance(req, res, next);
  }
}
