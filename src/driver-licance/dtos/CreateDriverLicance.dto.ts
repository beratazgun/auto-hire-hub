import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverLicanceDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  frontSide: Express.Multer.File[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  backSide: Express.Multer.File[];
}
