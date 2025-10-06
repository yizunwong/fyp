import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Res,
  Query,
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

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: RequestWithUser, @Body() body: LoginDto) {
    return this.authService.login(req, body);
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
  async googleAuthRedirect(
    @Request() req: RequestWithUser,
    @Res() res: Response,
    @Query('state') state?: string,
  ) {
    const result = await this.authService.oauthLogin(
      // req.user may come from GoogleStrategy; pass through as-is for now
      req.user as any,
    );
    if (state) {
      try {
        const url = new URL(state);
        url.searchParams.set('token', result.access_token);
        return res.redirect(url.toString());
      } catch {
        // fall back to JSON if state is not a valid URL
      }
    }
    return res.json(result);
  }
}
