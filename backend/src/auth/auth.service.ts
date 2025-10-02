import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/api/user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(plainPassword, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // omit password
    const { password, ...result } = user as any;
    return result;
  }

  async login(user: LoginDto) {
    const payload = { email: user.email };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
}
