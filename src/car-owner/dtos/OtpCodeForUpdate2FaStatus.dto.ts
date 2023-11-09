import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class OtpCodeForUpdate2FaStatusDto {
  @ApiProperty({
    example: true,
    description: 'Whether to enable or disable 2FA',
  })
  @IsNotEmpty()
  @IsBoolean()
  is2FAEnabled: boolean;

  @ApiProperty({
    example: '123456',
    description: 'The OTP code sent to the customer email address',
  })
  @IsString()
  @IsNotEmpty()
  otpCode: string;
}
