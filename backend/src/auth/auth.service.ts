import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/api/user/user.service';
import { JwtPayload } from './strategies/jwt.strategy';

type UserPayload = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<UserPayload> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(plainPassword, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: UserPayload) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
