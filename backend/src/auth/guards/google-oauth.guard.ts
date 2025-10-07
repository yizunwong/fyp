import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): Record<string, unknown> {
    const req = context.switchToHttp().getRequest<Request>();

    const q = req?.query ?? {};
    const incomingState =
      typeof (q as Record<string, unknown>).state === 'string'
        ? (q as Record<string, unknown>).state
        : undefined;

    // If caller already sent state, pass it through. Otherwise, build one.
    // Build state if not provided
    const state =
      incomingState ??
      (() => {
        const { redirect, platform: queryPlatform } =
          (q as Record<string, unknown>) || {};

        // Ensure platform is a string; fallback to header; default to 'web'
        const headerPlatformRaw = req.headers['x-client-platform'];
        const headerPlatform = Array.isArray(headerPlatformRaw)
          ? headerPlatformRaw[0]
          : headerPlatformRaw;

        const platform =
          (queryPlatform as string) || (headerPlatform as string) || 'web';

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
