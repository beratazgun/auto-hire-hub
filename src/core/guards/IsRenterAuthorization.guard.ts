import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './enums/Role.enums';

@Injectable()
export class IsRenterAuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { role } = request.session.user;

    if (role !== Role.renter) {
      throw new UnauthorizedException('you are not authorized to do this.');
    }

    return true;
  }
}
