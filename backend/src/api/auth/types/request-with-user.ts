import { Request } from 'express';
import type { JwtPayload } from '../strategies/jwt.strategy';
import { OAuthProfilePayload } from '../auth.service';

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

export interface RequestWithOAuthUser extends Request {
  user: OAuthProfilePayload;
}
