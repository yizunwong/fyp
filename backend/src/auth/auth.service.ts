import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/api/user/user.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { RequestWithUser } from './types/request-with-user';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const match = await bcrypt.compare(plainPassword, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(req: RequestWithUser, user: LoginDto) {
    const payload: JwtPayload = {
      id: req.user.id,
      email: user.email,
      role: req.user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
