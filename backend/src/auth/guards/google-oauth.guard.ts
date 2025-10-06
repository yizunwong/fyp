import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): any {
    const req = context.switchToHttp().getRequest();
    const redirect = (req?.query?.redirect as string) || undefined;
    return {
      scope: ['email', 'profile'],
      prompt: 'consent',
      accessType: 'offline',
      state: redirect, // pass frontend return URL through OAuth state
    };
  }
}
