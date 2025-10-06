import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(): any {
    return {
      scope: ['email', 'profile'],
      prompt: 'consent',
      accessType: 'offline',
    };
  }
}
