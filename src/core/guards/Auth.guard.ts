import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfManagerService } from '../services/CsrfManager.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private csrfManager: CsrfManagerService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { csrfToken } = request.session;

    if (!request.session.user) {
      throw new UnauthorizedException('You are not logged in!. Please login');
    }

    if (!csrfToken || request.cookies.csrfToken !== csrfToken) {
      this.csrfManager.sendCSRFToken(request, response);
    }

    return true;
  }
}
