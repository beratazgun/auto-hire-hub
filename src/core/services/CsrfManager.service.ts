import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Tokens from 'csrf';
import { Request, Response } from 'express';

@Injectable()
export class CsrfManagerService {
  constructor(private configService: ConfigService) {}

  /**
   * Send CSRF token method
   * @param req - Request object
   * @param res - Response object
   * @description This method is used to send csrf token to the client
   */
  sendCSRFToken(req: Request, res: Response) {
    const secret = new Tokens().secretSync();
    const token = new Tokens().create(secret);

    res.cookie('csrfToken', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.configService.get<number>('SESSION_TIME'),
    });

    req.session.csrfToken = token;
  }
}
