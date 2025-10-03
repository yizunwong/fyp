import { Request } from 'express';
import type { JwtPayload } from '../strategies/jwt.strategy';

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
