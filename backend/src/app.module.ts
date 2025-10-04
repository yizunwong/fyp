import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './auth/auth.module';
import { FarmerModule } from './api/farmer/farmer.module';
import { FarmModule } from './api/farm/farm.module';
import { ProduceModule } from './api/produce/produce.module';
import { SubsidyModule } from './api/subsidy/subsidy.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    FarmerModule,
    FarmModule,
    ProduceModule,
    SubsidyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
