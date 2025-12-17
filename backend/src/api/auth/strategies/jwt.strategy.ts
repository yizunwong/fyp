import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import type { Role } from '@prisma/client';
import type { Request } from 'express';

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: Role;
  emailVerifiedAt?: Date | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (req: Request | undefined) => req?.cookies?.['access_token'],
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_jwt_secret',
    });
  }
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
