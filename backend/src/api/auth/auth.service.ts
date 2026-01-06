import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/api/user/user.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { RequestWithUser } from './types/request-with-user';
import { LoginDto } from './dto/requests/login.dto';
import { CreateUserDto } from 'src/api/user/dto/requests/create-user.dto';
import { generateFromEmail } from 'unique-username-generator';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/common/email/email.service';
import { randomBytes, createHash } from 'crypto';
import { ResetPasswordDto } from './dto/requests/reset-password.dto';
import { RequestPasswordResetDto } from './dto/requests/request-password-reset.dto';
import { Role, UserStatus, UserTokenType } from 'prisma/generated/prisma/enums';
import { User } from 'prisma/generated/prisma/client';

interface RefreshTokenPayload {
  id: string;
  email: string;
  role: Role;
  type: 'refresh';
  username?: string;
  emailVerifiedAt?: Date | null;
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
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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
    // req.user is a User object from LocalStrategy, cast to access emailVerifiedAt
    const userObj = req.user as unknown as User;
    const payload: JwtPayload = {
      id: req.user.id,
      username: req.user.username,
      email: user.email,
      role: req.user.role,
      emailVerifiedAt: userObj.emailVerifiedAt,
    };
    const { access_token, refresh_token } = await this.issueTokens(payload);
    return { access_token, refresh_token };
  }

  async register(data: CreateUserDto) {
    if (!data.email) throw new BadRequestException('Email is required');
    if (data.username === undefined) {
      data.username = generateFromEmail(data.email, 5);
    }

    if (
      (data.provider ?? 'local') === 'local' &&
      data.password &&
      data.password !== data.confirmPassword
    ) {
      throw new BadRequestException(
        'Password and confirmPassword do not match',
      );
    }

    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new BadRequestException('Email already in use');

    const created = await this.usersService.createUser(data);
    if (!created) throw new BadRequestException('Failed to create user');

    const payload: JwtPayload = {
      id: created.id,
      username: created.username,
      email: created.email,
      role: created.role,
      emailVerifiedAt: null, // New users haven't verified email yet
    };

    // Fire-and-forget email verification token (non-blocking)
    void this.sendEmailVerification(created.id, created.email);

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
      // Auto-link: If user exists with local provider but signing in with Google,
      // automatically link the Google account
      if (existing.provider === 'local' && payload.provider === 'google') {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            provider: 'google',
            providerId: payload.providerId,
            emailVerifiedAt: existing.emailVerifiedAt || new Date(),
          },
        });

        const jwtPayload: JwtPayload = {
          id: existing.id,
          username: existing.username,
          email: existing.email,
          role: existing.role,
          emailVerifiedAt: existing.emailVerifiedAt || new Date(),
        };

        return this.issueTokens(jwtPayload);
      }

      if (existing.provider === payload.provider) {
        const jwtPayload: JwtPayload = {
          id: existing.id,
          username: existing.username,
          email: existing.email,
          role: existing.role,
          emailVerifiedAt: existing.emailVerifiedAt,
        };

        return this.issueTokens(jwtPayload);
      }

      throw new UnauthorizedException(
        `This account was created using ${existing.provider}. Please sign in with ${existing.provider}.`,
      );
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

    if (!created) throw new BadRequestException('Failed to create user');

    const jwtPayload: JwtPayload = {
      id: created.id,
      username: created.username,
      email: created.email,
      role: created.role,
      emailVerifiedAt: null, // New OAuth users haven't verified email yet
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
      const { id, email, role, username, emailVerifiedAt } = decoded;
      return { id, email, role, username: username ?? '', emailVerifiedAt };
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

  /**
   * EMAIL VERIFICATION
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getAppBaseUrl(): string {
    return (
      process.env.WEB_APP_URL ||
      process.env.MOBILE_APP_URL ||
      process.env.APP_BASE_URL ||
      'http://localhost:3000'
    );
  }

  private buildVerificationUrl(token: string): string {
    const base = this.getAppBaseUrl().replace(/\/$/, '');
    const path =
      process.env.EMAIL_VERIFICATION_PATH || '/auth/verify-email?token=';
    return `${base}${path.includes('token=') ? path : `${path}?token=`}${token}`;
  }

  private buildPasswordResetUrl(token: string): string {
    const base = this.getAppBaseUrl().replace(/\/$/, '');
    const path = process.env.PASSWORD_RESET_PATH || '/forgot-password?token=';
    return `${base}${path.includes('token=') ? path : `${path}?token=`}${token}`;
  }

  private async createUserToken(
    userId: string,
    type: UserTokenType,
    ttlMinutes: number,
  ): Promise<string> {
    const rawToken = this.generateToken();
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + ttlMinutes * 60 * 1000,
    ).toISOString();

    // Invalidate any existing unused tokens of the same type
    await this.prisma.userToken.updateMany({
      where: {
        userId,
        type,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await this.prisma.userToken.create({
      data: {
        userId,
        tokenHash,
        type,
        expiresAt: new Date(expiresAt),
      },
    });

    return rawToken;
  }

  private async consumeUserToken(
    token: string,
    type: UserTokenType,
  ): Promise<{
    user: User;
  }> {
    const tokenHash = this.hashToken(token);

    const userToken = await this.prisma.userToken.findFirst({
      where: {
        tokenHash,
        type,
      },
      include: {
        user: true,
      },
    });

    if (!userToken) {
      throw new NotFoundException('Token not found or already used');
    }

    if (userToken.usedAt) {
      throw new BadRequestException('Token has already been used');
    }

    if (userToken.expiresAt < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    await this.prisma.userToken.update({
      where: {
        id: userToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return { user: userToken.user };
  }

  async sendEmailVerification(userId: string, email: string): Promise<void> {
    const token = await this.createUserToken(
      userId,
      UserTokenType.EMAIL_VERIFICATION,
      Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES || 60),
    );

    const verifyUrl = this.buildVerificationUrl(token);

    const subject = 'Verify your email address';
    const html = `
      <p>Hi,</p>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>If you did not create this account, you can ignore this email.</p>
    `;

    const text = `Please verify your email by visiting the following link: ${verifyUrl}`;

    await this.emailService.sendEmail(email, subject, html, text);
  }

  async verifyEmail(token: string): Promise<void> {
    const { user } = await this.consumeUserToken(
      token,
      UserTokenType.EMAIL_VERIFICATION,
    );

    if (user.status === UserStatus.ACTIVE && user.emailVerifiedAt) {
      // Already verified; nothing to do
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
      },
    });
  }

  /**
   * PASSWORD RESET
   */
  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);

    // To avoid leaking whether a user exists, always respond success
    if (!user || user.provider !== 'local') {
      return;
    }

    const token = await this.createUserToken(
      user.id,
      UserTokenType.PASSWORD_RESET,
      Number(process.env.PASSWORD_RESET_TTL_MINUTES || 60),
    );

    const resetUrl = this.buildPasswordResetUrl(token);

    const subject = 'Reset your password';
    const html = `
      <p>Hi,</p>
      <p>We received a request to reset your password. If this was you, click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `;

    const text = `Reset your password by visiting the following link: ${resetUrl}`;

    await this.emailService.sendEmail(user.email, subject, html, text);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(
        'Password and confirmPassword do not match',
      );
    }

    const { user } = await this.consumeUserToken(
      dto.token,
      UserTokenType.PASSWORD_RESET,
    );

    const hashed = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
      },
    });
  }
}
