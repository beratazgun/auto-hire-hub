import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Body,
  Post,
  Res,
  Param,
  Next,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { RenterService } from './renter.service';
import { NextFunction, Request, Response } from 'express';
import {
  ForgotPassword,
  OtpCodeForUpdate2FaStatusDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  SigninDto,
  UpdatePasswordDto,
  SignupDto,
} from './dtos/dtos';
import { AuthGuard } from '@src/core/guards/Auth.guard';

@ApiTags('renter')
@Controller('/api/v1/renter')
export class RenterController {
  constructor(private renterService: RenterService) {}

  /**
   * SİGN UP
   *
   * */
  @ApiOperation({
    summary: 'Sign up a new renter account',
    description:
      'Sign up a new renter account. A verification email will be sent to the email address.',
  })
  @Post('/auth/signup')
  signup(@Body() body: SignupDto, @Res() res: Response) {
    return this.renterService.signup(body, res);
  }

  /**
   * VERIFY ACCOUNT
   *
   * */
  @ApiOperation({
    summary: 'Verify a customer account',
    description: 'Verify a customer account using the token sent to the email',
  })
  @Post('/verify/verify-account/:token')
  verifyAccount(
    @Param('token') token: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.renterService.verifyAccount(token, res, next);
  }

  /**
   * RESEND VERIFICATION EMAIL
   *
   * */
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Resend verification email to the email address',
  })
  @Post('/auth/resend/verify-email')
  resendVerificationEmail(
    @Body() body: ResendVerificationEmailDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.renterService.resendVerificationEmail(body, res, next);
  }

  /**
   * SIGN IN
   *
   * */
  @ApiOperation({
    summary: 'Sign in to a renter account',
    description:
      'Sign in to a renter account using email and password. If 2FA is enabled, the renter will be asked to enter the OTP code sent to the email address.',
  })
  @Post('/auth/signin')
  signin(
    @Body() body: SigninDto,
    @Res() res: Response,
    @Req() req: Request,
    @Next() next: NextFunction,
  ) {
    return this.renterService.signin(body, req, res, next);
  }

  /**
   * SEND OTP CODE FOR UPDATE 2FA STATUS
   *
   * */
  @ApiOperation({
    summary: 'Send a OTP code to the email address',
    description:
      'Send a OTP code to the email address. This is used to enable or disable 2FA.',
  })
  @UseGuards(AuthGuard)
  @ApiProperty({ name: 'is2FAEnabled', type: Boolean, required: true })
  @Post('/account/auth/2fa/send-otp-code')
  sendOtpCodeForUpdate2FAStatus(
    @Body('is2FAEnabled')
    is2FAEnabled: boolean,
    @Res() res: Response,
    @Req() req: Request,
    @Next() next: NextFunction,
  ) {
    return this.renterService.sendOtpCodeForUpdate2FAStatus(
      is2FAEnabled,
      req,
      res,
      next,
    );
  }

  /**
   * VERIFY OTP CODE FOR UPDATE 2FA STATUS
   *
   * */
  @ApiOperation({
    summary: 'Enable or disable 2FA',
    description: 'This will enable or disable 2FA for a customer account.',
  })
  @UseGuards(AuthGuard)
  @Post('/account/auth/2fa/update-status')
  verfiyOtpCodeForUpdate2FAStatus(
    @Body() body: OtpCodeForUpdate2FaStatusDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.renterService.verfiyOtpCodeForUpdate2FAStatus(
      body,
      req,
      res,
      next,
    );
  }

  /**
   * VERIFY OTP CODE FOR SIGN IN
   *
   * */
  @ApiOperation({
    summary: 'Verify a OTP code for sign in',
    description:
      'Enable or disable 2FA for a customer account. If enabled, the customer will be asked to enter the OTP code sent to the email address.',
  })
  @Post('/auth/signin/2fa/verify/:otpCode')
  verifyOtpCodeForSignin(
    @Param('otpCode') otpCode: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.renterService.verifyOtpCodeForSignin(otpCode, req, res, next);
  }

  /**
   * SIGN OUT
   *
   * */
  @ApiOperation({
    summary: 'Sign out from a customer account',
  })
  @UseGuards(AuthGuard)
  @Post('/account/signout')
  signout(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.renterService.signout(req, res, next);
  }

  /**
   * GET RENTER PROFILE
   *
   * */
  @ApiOperation({
    summary: 'Get renter profile',
    description: 'Get renter profile',
  })
  @UseGuards(AuthGuard)
  @Get('account/me')
  getMe(@Req() req: Request, @Res() res: Response) {
    return this.renterService.getMe(req, res);
  }

  @ApiOperation({
    summary:
      'This will send a forgot password email to the renter email address',
  })
  @Post('/auth/forgot-password')
  sendForgotPasswordEmail(
    @Body() body: ForgotPassword,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.renterService.sendForgotPasswordEmail(body, req, res, next);
  }

  @ApiOperation({
    summary: 'This will reset the password of a renter account',
  })
  @Post('/auth/reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() body: ResetPasswordDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.renterService.resetPassword(token, body, res, next);
  }

  @Post('/account/me/update-password')
  @UseGuards(AuthGuard)
  updatePassword(
    @Body() body: UpdatePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.renterService.updatePassword(body, req, res, next);
  }
}
