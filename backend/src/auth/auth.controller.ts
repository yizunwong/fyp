import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestWithUser } from './types/request-with-user';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Role } from '@prisma/client';
import { CreateUserDto } from 'src/api/user/dto/create-user.dto';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import type { Response } from 'express';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: RequestWithUser,
    @Req() rawReq: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ) {
    const tokens = await this.authService.login(req, body);
    const platform = String(req.headers['x-client-platform'] || '');
    const isWeb = platform === 'web';
    console.log('isWeb', isWeb);
    if (isWeb) {
      // Set refresh token as HttpOnly cookie for web
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
    }
    // Mobile: return both tokens in JSON
    return tokens;
  }

  @Post('refresh')
  async refresh(@Req() req: RequestWithCookies, @Body() body: RefreshTokenDto) {
    // Web: pull from cookie; Mobile: body.refresh_token
    const tokenFromCookie = req.cookies?.['refresh_token'];
    const refreshToken = (
      tokenFromCookie ||
      body?.refresh_token ||
      ''
    ).toString();

    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenDto,
  ) {
    const platform = String(req.headers['x-client-platform'] || '');
    const isWeb = platform === 'web';
    if (isWeb) {
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } else {
      // If stored refresh tokens are used, invalidate here
      // For now, nothing to do server-side for mobile
      void body?.refresh_token;
    }
    return { message: 'Logged out successfully' };
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.RETAILER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @Get('profile')
  profile(@Request() req: RequestWithUser) {
    return req.user;
  }

  // Google OAuth
  @UseGuards(GoogleOauthGuard)
  @Get('google')
  async googleAuth() {}

  @UseGuards(GoogleOauthGuard)
  @Get('google/callback')
  async googleAuthCallback(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.oauthLogin(req.user);

    // Prefer platform from OAuth `state` (set in GoogleOauthGuard), fallback to header
    const rawState = (req.query?.state as string) || '';
    let statePlatform = '' as string;
    try {
      const parsed = JSON.parse(rawState || '{}') as { platform?: string };
      statePlatform = String(parsed?.platform || '');
    } catch {
      statePlatform = '';
    }

    const platform = String(
      statePlatform || (req.headers['x-client-platform'] as string) || '',
    );
    const isWeb = platform === 'web';

    console.log('isWeb', isWeb);

    if (isWeb) {
      // Set cookies for web
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      console.log('Frontend URL:', process.env.MOBILE_APP_URL);

      // Redirect to frontend. Prefer redirect from state; fallback to env; then '/'
      let redirectUrl = '';
      try {
        const parsed = JSON.parse((req.query?.state as string) || '{}') as {
          redirect?: string;
        };
        redirectUrl = String(parsed?.redirect || '');
      } catch (err) {
        // Ignore invalid or missing state; fall back to defaults
        redirectUrl = '';
        void err;
      }

      const finalRedirect =
        redirectUrl ||
        process.env.MOBILE_APP_URL ||
        process.env.WEB_APP_URL ||
        '/';
      return res.redirect(
        finalRedirect.endsWith('/') ? finalRedirect : `${finalRedirect}/`,
      );
    }

    // For mobile, return tokens in JSON
    return tokens;
  }
}
