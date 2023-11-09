import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';

@Injectable()
class OtpManagerService {
  constructor(private readonly configService: ConfigService) {}

  generateOtpCode(): string {
    return authenticator.generate(this.configService.get<string>('OTP_SECRET'));
  }

  verifyOtpCode(otpCode: string): boolean {
    return authenticator.verify({
      token: otpCode,
      secret: this.configService.get('OTP_SECRET'),
    });
  }
}

export { OtpManagerService };
