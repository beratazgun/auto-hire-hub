import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendVerificationEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'test@gmail.com',
  })
  email: string;
}
