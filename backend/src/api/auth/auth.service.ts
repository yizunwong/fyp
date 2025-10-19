import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/api/user/user.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { RequestWithUser } from './types/request-with-user';
import { Role, User } from '@prisma/client';
import { LoginDto } from './dto/requests/login.dto';
import { CreateUserDto } from 'src/api/user/dto/requests/create-user.dto';
import { generateFromEmail } from 'unique-username-generator';

interface RefreshTokenPayload {
  id: string;
  email: string;
  role: Role;
  type: 'refresh';
  [key: string]: any; // optional other fields
}

export interface OAuthProfilePayload {
  provider: string;
  providerId: string;
  email?: string;
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    if (user.provider === 'google') {
      throw new UnauthorizedException(
        'This account was created using Google. Please sign in with Google.',
      );
    }

    if (user.password !== null) {
      const match = await bcrypt.compare(plainPassword, user.password);
      if (!match) throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async signAccessToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      secret: process.env.JWT_SECRET || 'dev_jwt_secret',
    });
  }

  private async signRefreshToken(payload: JwtPayload) {
    const refreshPayload: RefreshTokenPayload = {
      ...payload,
      type: 'refresh',
    };

    return this.jwtService.signAsync(refreshPayload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      secret: process.env.JWT_SECRET || 'dev_jwt_secret',
    });
  }

  async issueTokens(payload: JwtPayload) {
    const access_token = await this.signAccessToken(payload);
    const refresh_token = await this.signRefreshToken(payload);
    return { access_token, refresh_token };
  }

  async login(req: RequestWithUser, user: LoginDto) {
    const payload: JwtPayload = {
      id: req.user.id,
      email: user.email,
      role: req.user.role,
    };
    const { access_token, refresh_token } = await this.issueTokens(payload);
    return { access_token, refresh_token };
  }

  async register(data: CreateUserDto) {
    if (!data.email) throw new BadRequestException('Email is required');
    if (data.username === undefined) {
      data.username = generateFromEmail(data.email, 5);
    }

    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new BadRequestException('Email already in use');

    const created = await this.usersService.createUser(data);

    const payload: JwtPayload = {
      id: created.id,
      email: created.email,
      role: created.role,
    };

    return {
      access_token: await this.signAccessToken(payload),
      refresh_token: await this.signRefreshToken(payload),
    };
  }

  // Issue JWT for OAuth-authenticated users
  async oauthLogin(payload: OAuthProfilePayload) {
    if (!payload.email) {
      throw new BadRequestException(
        'OAuth provider did not return an email address',
      );
    }

    const existing = await this.usersService.findByEmail(payload.email);

    if (existing) {
      if (existing.provider !== payload.provider) {
        throw new UnauthorizedException(
          `This account was created using ${existing.provider}. Please sign in with ${existing.provider}.`,
        );
      }

      const jwtPayload: JwtPayload = {
        id: existing.id,
        email: existing.email,
        role: existing.role,
      };

      return this.issueTokens(jwtPayload);
    }

    const created = await this.usersService.createUser({
      email: payload.email,
      nric: '',
      phone: undefined,
      role: Role.FARMER,
      password: null,
      provider: payload.provider,
      providerId: payload.providerId,
    });

    const jwtPayload: JwtPayload = {
      id: created.id,
      email: created.email,
      role: created.role,
    };

    return this.issueTokens(jwtPayload);
  }

  async verifyAndDecodeRefreshToken(
    refreshToken?: string,
  ): Promise<JwtPayload> {
    if (!refreshToken) throw new BadRequestException('Missing refresh token');

    try {
      const decoded = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret:
            process.env.JWT_REFRESH_SECRET ||
            process.env.JWT_SECRET ||
            'dev_jwt_secret',
        },
      );

      // Check that decoded exists and is the correct type
      if (!decoded || decoded.type !== 'refresh') {
        throw new ForbiddenException('Invalid token type');
      }

      // Destructure safely
      const { id, email, role } = decoded;
      return { id, email, role };
    } catch (e) {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
        e as string,
      );
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = await this.verifyAndDecodeRefreshToken(refreshToken);
    const access_token = await this.signAccessToken(payload);
    return { access_token };
  }
}
