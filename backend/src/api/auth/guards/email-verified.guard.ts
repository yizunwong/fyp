import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // We rely on the presence of emailVerifiedAt (or ACTIVE status) to determine verification.
    if (!('emailVerifiedAt' in user) || !user['emailVerifiedAt']) {
      throw new ForbiddenException('Email is not verified');
    }

    return true;
  }
}


