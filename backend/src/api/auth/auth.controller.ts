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
import { LoginDto } from './dto/requests/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  RequestWithCookies,
  RequestWithOAuthUser,
  RequestWithUser,
} from './types/request-with-user';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Role } from 'prisma/generated/prisma/client';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import type { Response } from 'express';
import { RefreshTokenDto } from './dto/requests/refresh-token.dto';
import { CreateUserDto } from 'src/api/user/dto/requests/create-user.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { TokenPairResponseDto } from './dto/responses/token-pair-response.dto';
import { AccessTokenResponseDto } from './dto/responses/access-token-response.dto';
import { LogoutResponseDto } from './dto/responses/logout-response.dto';
import { ProfileResponseDto } from './dto/responses/profile-response.dto';
import { RequestPasswordResetDto } from './dto/requests/request-password-reset.dto';
import { ResetPasswordDto } from './dto/requests/reset-password.dto';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiCommonResponse(TokenPairResponseDto, false, 'Login successful')
  async login(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ): Promise<CommonResponseDto<TokenPairResponseDto>> {
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
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Login successful',
      data: tokens,
    });
  }

  @Post('refresh')
  @ApiCommonResponse(AccessTokenResponseDto, false, 'Access token refreshed')
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenDto,
  ): Promise<CommonResponseDto<AccessTokenResponseDto>> {
    // Web: pull from cookie; Mobile: body.refresh_token
    const tokenFromCookie = req.cookies?.['refresh_token'];
    const refreshToken = (
      tokenFromCookie ||
      body?.refresh_token ||
      ''
    ).toString();

    const token = await this.authService.refreshAccessToken(refreshToken);

    const platform = String(req.headers['x-client-platform'] || '');
    const isWeb = platform === 'web';
    if (isWeb) {
      res.cookie('access_token', token.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
    }

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: token,
    });
  }

  @Post('logout')
  @ApiCommonResponse(LogoutResponseDto, false, 'Logged out successfully')
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenDto,
  ): CommonResponseDto<LogoutResponseDto> {
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
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Logged out successfully',
      data: { success: true },
    });
  }

  @Post('register')
  @ApiCommonResponse(
    TokenPairResponseDto,
    false,
    'User registered successfully',
  )
  async register(
    @Body() body: CreateUserDto,
  ): Promise<CommonResponseDto<TokenPairResponseDto>> {
    const tokens = await this.authService.register(body);
    return new CommonResponseDto({
      statusCode: 201,
      message: 'User registered successfully',
      data: tokens,
    });
  }

  @Post('verify-email')
  async verifyEmail(
    @Body('token') token: string,
  ): Promise<CommonResponseDto<null>> {
    await this.authService.verifyEmail(token);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Email verified successfully',
      data: null,
    });
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<CommonResponseDto<null>> {
    await this.authService.requestPasswordReset(dto);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'If the email exists, a reset link has been sent',
    });
  }

  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<CommonResponseDto<null>> {
    await this.authService.resetPassword(dto);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Password reset successfully',
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.RETAILER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @Get('profile')
  @ApiCommonResponse(ProfileResponseDto, false, 'Authenticated user profile')
  profile(
    @Request() req: RequestWithUser,
  ): CommonResponseDto<ProfileResponseDto> {
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: req.user,
    });
  }

  // Google OAuth
  @UseGuards(GoogleOauthGuard)
  @Get('google')
  async googleAuth() {}

  @UseGuards(GoogleOauthGuard)
  @Get('google/callback')
  @ApiCommonResponse(
    TokenPairResponseDto,
    false,
    'OAuth login successful (mobile clients receive tokens)',
  )
  async googleAuthCallback(
    @Req() req: RequestWithOAuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommonResponseDto<TokenPairResponseDto> | void> {
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
    return new CommonResponseDto({
      statusCode: 200,
      message: 'OAuth login successful',
      data: tokens,
    });
  }
}
