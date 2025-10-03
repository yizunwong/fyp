import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './auth/auth.module';
import { FarmerModule } from './api/farmer/farmer.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, FarmerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
