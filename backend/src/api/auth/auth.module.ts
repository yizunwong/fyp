import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/api/user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { EmailModule } from 'src/common/email/email.module';

@Module({
  imports: [
    UserModule,
    EmailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_jwt_secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    GoogleStrategy,
    EmailVerifiedGuard,
  ],
  exports: [AuthService, RolesGuard, EmailVerifiedGuard],
})
export class AuthModule {}
