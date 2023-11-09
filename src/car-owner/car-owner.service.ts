import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { Response, Request, NextFunction } from 'express';
import { PrismaService } from '@src/core/services/prisma/prisma.service';
import {
  ForgotPassword,
  OtpCodeForUpdate2FaStatusDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  SigninDto,
  SignupDto,
  UpdatePasswordDto,
} from './dtos/dtos';
import EmailManager from '@src/core/libs/EmailManager';
import { ConfirmEmailInterface } from '@src/core/interfaces/email-interfaces/ConfirmEmail.interface';
import { ConfigService } from '@nestjs/config';
import { omit } from 'lodash';
import * as bcrypt from 'bcryptjs';
import {
  GeneratorManager,
  IDPrefix,
  randomIdTypes,
} from '@src/core/libs/GeneratorManager';
import { redisClient } from '@src/core/libs/redisClient';
import { CsrfManagerService } from '@src/core/services/CsrfManager.service';
import { OtpManagerService } from '@src/core/services/OtpManager.service';
import { DateManager } from '@src/core/libs/DateManager';
import { ForgotPasswordEmailInterface } from '@src/core/interfaces/email-interfaces/ForgotPasswordEmail.interface';

@Injectable()
export class CarOwnerService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private csrfManagerService: CsrfManagerService,
    private otpManagerService: OtpManagerService,
  ) {}

  /**
   * Signup method
   * @param body - Request body (firstName, lastName, email, password, passwordConfirmation)
   * @param res - Response object
   * @description This method is used to create a new car owner account
   */
  async signup(body: SignupDto, res: Response) {
    const carOwner = await this.prismaService.carOwner.create({
      data: {
        ...omit(body, ['passwordConfirmation', 'password']),
        password: await bcrypt.hash(body.password, 12),
        fullName: `${body.firstName} ${body.lastName}`,
        carOwnerCode: GeneratorManager.generateRandomId(
          16,
          randomIdTypes.number,
          IDPrefix.carOwnerID,
        ),
      },
    });

    if (carOwner) {
      const confirmToken = GeneratorManager.generateRandomId(
        48,
        randomIdTypes.textAndNumber,
      );

      await redisClient.set(
        GeneratorManager.generateRedisKey('confirm-account', confirmToken),
        JSON.stringify({
          carOwnerCode: carOwner.carOwnerCode,
          confirmToken: confirmToken,
        }),
        'EX',
        10 * 60,
      );

      new EmailManager().sendEmail<ConfirmEmailInterface>({
        to: carOwner.email,
        subject: 'Confirm your email address',
        template: 'confirmEmail',
        data: {
          firstName: carOwner.firstName,
          email: carOwner.email,
          confirmLink: `${this.configService.get<string>(
            'DEV_URL',
          )}/verify/confirm-account/${confirmToken}`,
        },
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        isSuccess: true,
        message:
          'You are successfully signed up. Please check your email and verify your account',
      });
    }
  }

  /**
   * Verify account method
   * @param token - Token will be taken from the url | (confirmToken)
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to verify a car owner account
   */
  async verifyAccount(token: string, res: Response, next: NextFunction) {
    const redisKey = GeneratorManager.generateRedisKey(
      'confirm-account',
      token,
    );

    const getUserAccountVerificationData = JSON.parse(
      await redisClient.get(redisKey),
    );

    if (!getUserAccountVerificationData) {
      return next(
        new UnauthorizedException(
          'Your account verification token has been expired',
        ),
      );
    }

    const carOwner = await this.prismaService.carOwner.findUnique({
      where: {
        carOwnerCode: getUserAccountVerificationData.carOwnerCode,
        isAccountApproved: false,
      },
    });

    if (!carOwner) {
      return next(
        new UnauthorizedException(
          'User not found. Please contact our support team for more information',
        ),
      );
    }

    await this.prismaService.carOwner.update({
      where: {
        carOwnerCode: getUserAccountVerificationData.carOwnerCode,
      },
      data: {
        isAccountApproved: true,
        accountApprovedAt: new Date(Date.now()),
      },
    });

    redisClient.del(redisKey);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      isSuccess: true,
      message: 'Your account has been verified successfully',
    });
  }

  /**
   * Resend verification email method
   * @param body - Request body | (email)
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to resend verification email to user's email address.
   */
  async resendVerificationEmail(
    body: ResendVerificationEmailDto,
    res: Response,
    next: NextFunction,
  ) {
    const carOwner = await this.prismaService.carOwner.findUnique({
      where: {
        email: body.email,
        isAccountApproved: false,
      },
    });

    if (!carOwner) {
      return next(
        new BadRequestException(
          'Your email address is not found or your account is already verified.',
        ),
      );
    }

    const confirmToken = GeneratorManager.generateRandomId(
      48,
      randomIdTypes.textAndNumber,
    );

    await redisClient.set(
      GeneratorManager.generateRedisKey('confirm-account', confirmToken),
      JSON.stringify({
        carOwnerCode: carOwner.carOwnerCode,
        token: confirmToken,
      }),
      'EX',
      10 * 60,
    );

    new EmailManager().sendEmail<ConfirmEmailInterface>({
      to: carOwner.email,
      subject: 'Confirm your email address',
      template: 'confirmEmail',
      data: {
        firstName: carOwner.firstName,
        email: carOwner.email,
        confirmLink: `${this.configService.get<string>(
          'DEV_URL',
        )}/verify/confirm-account/${confirmToken}`,
      },
    });

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      isSuccess: true,
      message: 'Your verification email has been sent successfully.',
    });
  }

  /**
   * Signin method
   * @param body - Request body (email and password)
   * @param req - Request object
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to signin a car owner account. İf 2FA is enabled, user will be asked to enter OTP code. İf 2FA is disabled, user will be signed in and session will be created,.
   */
  async signin(
    body: SigninDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const carOwner = await this.prismaService.carOwner.findFirst({
      where: {
        email: body.email,
      },
    });

    if (
      !carOwner ||
      !(await bcrypt.compare(body.password, carOwner.password))
    ) {
      return next(
        new UnauthorizedException('Your email or password is wrong.'),
      );
    }

    if (!carOwner.isAccountApproved) {
      return next(
        new UnauthorizedException(
          'Your account is not verified. Please verify your account.',
        ),
      );
    }

    if (carOwner.isAccountBlocked) {
      return next(
        new UnauthorizedException(
          'Your account is blocked. Please contact support.',
        ),
      );
    }

    if (!carOwner.isAccountActive) {
      return next(
        new UnauthorizedException(
          'Your account is not active. Please contact support.',
        ),
      );
    }

    if (carOwner.isAccountDeleted) {
      return next(
        new UnauthorizedException(
          'Your account is deleted. Please contact support.',
        ),
      );
    }

    if (carOwner.is2FAEnabled) {
      const otpCode = this.otpManagerService.generateOtpCode();

      const generateOtpReference = GeneratorManager.generateRandomId(
        32,
        randomIdTypes.textAndNumber,
        IDPrefix.otpRef,
      );

      res.cookie('otpRef', generateOtpReference, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        maxAge: this.configService.get<number>('OTP_EXPIRATION_TIME') * 1000, // miliseconds
        expires: DateManager.addFromCurrentDate({ minute: 3 }), // seconds
      });

      await redisClient.set(
        GeneratorManager.generateRedisKey(
          'signin:otpCode',
          generateOtpReference,
        ),
        JSON.stringify({
          carOwnerCode: carOwner.carOwnerCode,
          otpCode,
        }),
        'EX',
        this.configService.get<number>('OTP_EXPIRATION_TIME'),
      );

      new EmailManager().sendEmail({
        to: carOwner.email,
        subject: 'Your OTP code',
        template: 'otpEmailForSignin',
        data: {
          firstName: carOwner.firstName,
          email: carOwner.email,
          otpCode,
        },
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        isSuccess: true,
        message: 'Your OTP code has been sent to your email address.',
      });
    } else {
      req.session.user = carOwner;
      this.csrfManagerService.sendCSRFToken(req, res);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        isSuccess: true,
        message: 'You are successfully signed in.',
      });
    }
  }

  /**
   * Send OTP code for update 2FA status method
   * @param is2FAEnabled - 2FA status | true or false
   * @param req - Request object
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to send OTP code to user's email address. This OTP code is used to enable or disable 2FA.
   */
  async sendOtpCodeForUpdate2FAStatus(
    is2FAEnabled: boolean,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const otpCode = this.otpManagerService.generateOtpCode();
    const carOwner = req.session.user;

    if (carOwner.is2FAEnabled === is2FAEnabled) {
      return next(
        new BadRequestException(
          `Your 2FA status is already ${is2FAEnabled ? 'enabled' : 'disabled'}`,
        ),
      );
    }

    const generateOtpReference = GeneratorManager.generateRandomId(
      32,
      randomIdTypes.textAndNumber,
      IDPrefix.otpRef,
    );

    res.cookie('otpRef', generateOtpReference, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge: this.configService.get<number>('OTP_EXPIRATION_TIME') * 1000, // miliseconds
      expires: DateManager.addFromCurrentDate({ minute: 3 }), // seconds
    });

    await redisClient.set(
      GeneratorManager.generateRedisKey(
        'update2FAStatus#otpCode',
        generateOtpReference,
      ),
      JSON.stringify({
        carOwnerCode: carOwner.carOwnerCode,
        otpCode,
        is2FAEnabled,
      }),
      'EX',
      this.configService.get<number>('OTP_EXPIRATION_TIME'),
    );

    new EmailManager().sendEmail({
      to: carOwner.email,
      subject: 'Your OTP code',
      template: 'otpEmailForUpdate2FAstatus',
      data: {
        firstName: carOwner.firstName,
        email: carOwner.email,
        otpCode,
      },
    });

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      isSuccess: true,
      message: 'Your OTP code has been sent to your email address.',
    });
  }

  /**
   * Verify OTP code for update 2FA status method
   * @param body - Request body (otpCode, is2FAEnabled)
   * @param req - Request object
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to verify OTP code. İf OTP code is valid, user's 2FA status will be updated and session will be updated. otpRef should be sent as a cookie.
   */
  async verfiyOtpCodeForUpdate2FAStatus(
    body: OtpCodeForUpdate2FaStatusDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const carOwner = req.session.user;
    const otpRef: string | null = req.cookies.otpRef;
    const getOtpFromRedis = JSON.parse(
      await redisClient.get(
        GeneratorManager.generateRedisKey('update2FAStatus#otpCode', otpRef),
      ),
    );

    if (!getOtpFromRedis) {
      return next(
        new UnauthorizedException(
          'Your OTP code has been expired. Please try again.',
        ),
      );
    }

    if (getOtpFromRedis.is2FAEnabled !== body.is2FAEnabled) {
      return next(
        new UnauthorizedException(
          `Your 2FA status is already ${
            !getOtpFromRedis.is2FAEnabled ? 'enabled' : 'disabled'
          }`,
        ),
      );
    }

    if (getOtpFromRedis.otpCode !== body.otpCode) {
      return next(
        new UnauthorizedException('Your OTP code is wrong. Please try again.'),
      );
    } else {
      const updateCarOwner = await this.prismaService.carOwner.update({
        where: {
          carOwnerCode: carOwner.carOwnerCode,
        },
        data: {
          is2FAEnabled: body.is2FAEnabled,
        },
      });

      req.session.user = updateCarOwner;
      req.session.csrfToken = req.cookies.csrfToken;

      res.clearCookie('otpRef');

      redisClient.del(
        GeneratorManager.generateRedisKey('update2FAStatus#otpCode', otpRef),
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        isSuccess: true,
        message: 'You are succesfully updated your 2FA status.',
      });
    }
  }

  /**
   *
   * Verify OTP code method
   * @description This method is used to verify OTP code. İf OTP code is valid, user will be signed in and JWT token will be sent to user's browser. otpRef should be sent as a cookie.
   */
  async verifyOtpCodeForSignin(
    otpCode: string,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const otpRef: string | null = req.cookies.otpRef;
    const getOtpFromRedis = JSON.parse(
      await redisClient.get(
        GeneratorManager.generateRedisKey('signin:otpCode', otpRef),
      ),
    );

    if (!getOtpFromRedis) {
      return next(
        new UnauthorizedException(
          'Your OTP code has been expired. Please try again.',
        ),
      );
    }

    if (getOtpFromRedis.otpCode !== otpCode) {
      return next(
        new UnauthorizedException('Your OTP code is wrong. Please try again.'),
      );
    } else {
      const carOwner = await this.prismaService.carOwner.findUnique({
        where: {
          carOwnerCode: getOtpFromRedis.carOwnerCode,
        },
      });

      res.clearCookie('otpRef');

      req.session.user = carOwner;
      this.csrfManagerService.sendCSRFToken(req, res);

      redisClient.del(
        GeneratorManager.generateRedisKey('signin:otpCode', otpRef),
      );
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      isSuccess: true,
      message: 'You are successfully signed in',
    });
  }

  /**
   * Signout user
   * @param req - Request object
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to signout user. Session will be destroyed and csrfToken and sesID cookies will be cleared.
   */
  async signout(req: Request, res: Response, next: NextFunction) {
    req.session.destroy((err) => {
      if (err) {
        return next(
          new InternalServerErrorException(
            'Something went wrong. Please try again later.',
          ),
        );
      }

      res.clearCookie('csrfToken');
      res.clearCookie('sesID');
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        isSuccess: true,
        message: 'You are successfully signed out.',
      });
    });
  }

  /**
   * Get car owner profile
   * @param req - Request object
   * @param res - Response object
   * @description This method is used to get car owner profile.
   */
  async getMe(req: Request, res: Response) {
    const modifiedUser = omit(req.session.user, ['password']);
    res.status(200).json({
      isSuccess: true,
      status: 'success',
      statusCode: 200,
      result: modifiedUser,
    });
  }

  /**
   * Send forgot password email
   * @param body - Request body (email)
   * @param req - Request object
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to send forgot password email to car owner's email address.
   */
  async sendForgotPasswordEmail(
    body: ForgotPassword,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const chechEmail = await this.prismaService.carOwner.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!chechEmail) {
      return next(new BadRequestException('Your email address is not found.'));
    }

    const resetToken = GeneratorManager.generateRandomId(
      48,
      randomIdTypes.textAndNumber,
    );

    new EmailManager().sendEmail<ForgotPasswordEmailInterface>({
      to: chechEmail.email,
      subject: 'Reset your password',
      template: 'forgotPasswordEmail',
      data: {
        firstName: chechEmail.firstName,
        email: chechEmail.email,
        resetPasswordLink: `${this.configService.get<string>(
          'DEV_URL',
        )}/reset-password/${resetToken}`,
      },
    });

    redisClient.set(
      GeneratorManager.generateRedisKey('reset-password', resetToken),
      JSON.stringify({
        carOwnerCode: chechEmail.carOwnerCode,
        resetToken,
      }),
      'EX',
      10 * 60,
    );

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      isSuccess: true,
      message: 'Your forgot password email has been sent successfully.',
    });
  }

  /**
   * Reset password
   * @param token - Token will be taken from the url | (resetToken)
   * @param body - Request body (newPassword, newPasswordConfirmation)
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to reset car owner's password.
   */
  async resetPassword(
    token: string,
    body: ResetPasswordDto,
    res: Response,
    next: NextFunction,
  ) {
    const redisKey = GeneratorManager.generateRedisKey('reset-password', token);
    const getResetPswDataFromRedis = JSON.parse(
      await redisClient.get(redisKey),
    );

    if (
      !getResetPswDataFromRedis ||
      getResetPswDataFromRedis.resetToken !== token
    ) {
      return next(
        new UnauthorizedException(
          'Your password reset token has been expired.',
        ),
      );
    }

    await this.prismaService.carOwner.update({
      where: {
        carOwnerCode: getResetPswDataFromRedis.carOwnerCode,
      },
      data: {
        password: await bcrypt.hash(body.newPassword, 12),
      },
    });

    redisClient.del(redisKey);
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      isSuccess: true,
      message: 'Your password has been reset successfully.',
    });
  }

  /**
   * Update password
   * @param body - Request body (currentPassword, newPassword, newPasswordConfirmation)
   * @param req - Request object
   * @param res - Response object
   * @param next - Next function
   * @description This method is used to update car owner's password.
   */
  async updatePassword(
    body: UpdatePasswordDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const carOwner = await this.prismaService.carOwner.findUnique({
      where: {
        carOwnerCode: req.session.user.carOwnerCode,
      },
    });

    if (!(await bcrypt.compare(body.currentPassword, carOwner.password))) {
      return next(
        new BadRequestException(
          'Your current password is wrong. Please try again.',
        ),
      );
    }

    const userWithUpdatedPassword = await this.prismaService.carOwner.update({
      where: {
        carOwnerCode: carOwner.carOwnerCode,
      },
      data: {
        password: await bcrypt.hash(body.newPassword, 12),
        updatedAt: new Date(Date.now()),
      },
    });

    req.session.user = userWithUpdatedPassword;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      isSuccess: true,
      message: 'Your password has been updated successfully.',
    });
  }
}
