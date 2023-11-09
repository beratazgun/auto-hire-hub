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
import { NextFunction, Request, Response } from 'express';

import {
  ForgotPassword,
  OtpCodeForUpdate2FaStatusDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  SigninDto,
  SignupDto,
  UpdatePasswordDto,
} from './dtos/dtos';
import { AuthGuard } from '@src/core/guards/Auth.guard';
import { CarOwnerService } from './car-owner.service';

@ApiTags('carOwner')
@Controller('/api/v1/car-owner')
export class CarOwnerController {
  constructor(private carOwnerService: CarOwnerService) {}

  /**
   * SİGN UP
   *
   * */
  @ApiOperation({
    summary: 'Sign up a new car owner account',
    description:
      'Sign up a new car owner account. A verification email will be sent to the email address.',
  })
  @Post('/auth/signup')
  signup(@Body() body: SignupDto, @Res() res: Response) {
    return this.carOwnerService.signup(body, res);
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
    this.carOwnerService.verifyAccount(token, res, next);
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
    this.carOwnerService.resendVerificationEmail(body, res, next);
  }

  /**
   * SIGN IN
   *
   * */
  @ApiOperation({
    summary: 'Sign in to a car owner account',
    description:
      'Sign in to a car owner account using email and password. If 2FA is enabled, the car owner will be asked to enter the OTP code sent to the email address.',
  })
  @Post('/auth/signin')
  signin(
    @Body() body: SigninDto,
    @Res() res: Response,
    @Req() req: Request,
    @Next() next: NextFunction,
  ) {
    this.carOwnerService.signin(body, req, res, next);
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
    this.carOwnerService.sendOtpCodeForUpdate2FAStatus(
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
    this.carOwnerService.verfiyOtpCodeForUpdate2FAStatus(body, req, res, next);
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
    this.carOwnerService.verifyOtpCodeForSignin(otpCode, req, res, next);
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
    this.carOwnerService.signout(req, res, next);
  }

  /**
   * GET car owner PROFILE
   *
   * */
  @ApiOperation({
    summary: 'Get car owner profile',
    description: 'Get car owner profile',
  })
  @UseGuards(AuthGuard)
  @Get('account/me')
  getMe(@Req() req: Request, @Res() res: Response) {
    this.carOwnerService.getMe(req, res);
  }

  @ApiOperation({
    summary:
      'This will send a forgot password email to the car owner email address',
  })
  @Post('/auth/forgot-password')
  sendForgotPasswordEmail(
    @Body() body: ForgotPassword,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.carOwnerService.sendForgotPasswordEmail(body, req, res, next);
  }

  @ApiOperation({
    summary: 'This will reset the password of a car owner account',
  })
  @Post('/auth/reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() body: ResetPasswordDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.carOwnerService.resetPassword(token, body, res, next);
  }

  @Post('/account/me/update-password')
  @UseGuards(AuthGuard)
  updatePassword(
    @Body() body: UpdatePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    this.carOwnerService.updatePassword(body, req, res, next);
  }
}
