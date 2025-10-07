import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): any {
    const req = context.switchToHttp().getRequest();
    const incomingState = (req?.query?.state as string) || undefined;
    // If caller already sent state, pass it through. Otherwise, build one.
    const state = incomingState
      ? incomingState
      : (() => {
          const redirect = (req?.query?.redirect as string) || undefined;
          // Derive platform from query or header; default to 'web' for browser flows
          const platform =
            (req?.query?.platform as string) ||
            (req?.headers?.['x-client-platform'] as string) ||
            'web';
          return JSON.stringify({ redirect, platform });
        })();
    return {
      scope: ['email', 'profile'],
      prompt: 'consent',
      accessType: 'offline',
      state, // pass platform (and optional redirect) through OAuth state
    };
  }
}
