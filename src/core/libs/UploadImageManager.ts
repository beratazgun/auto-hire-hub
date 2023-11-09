import multer from 'multer';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import fs from 'fs';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

class UploadImageManager {
  public configService: ConfigService = new ConfigService();

  static multerStorage(
    fileName: (req: Request, file: Express.Multer.File) => string,
    destination: string = 'tmp/uploads',
  ) {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, destination);
      },
      filename: function (req, file, cb) {
        cb(null, fileName(req, file));
      },
    });
  }

  async UploadImageManagerToTheCDN(
    imgPath: string,
    fileName: string,
    folderName: string,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_API_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });

    return await cloudinary.uploader.upload(
      imgPath,
      {
        public_id: fileName,
        folder: 'auto-hire-hub/' + folderName,
        overwrite: true,
      },
      (err: UploadApiErrorResponse, result: UploadApiResponse) => {
        if (err) {
          console.log(err);
        }

        fs.unlinkSync(imgPath);

        return result;
      },
    );
  }
}

export default UploadImageManager;
