import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './api/auth/auth.module';
import { FarmerModule } from './api/farmer/farmer.module';
import { FarmModule } from './api/farm/farm.module';
import { ProduceModule } from './api/produce/produce.module';
import { SubsidyModule } from './api/subsidy/subsidy.module';
import { VerifyModule } from './api/verify/verify.module';
import { RetailerModule } from './api/retailer/retailer.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { CloudinaryModule } from './api/cloudinary/cloudinary.module';
import { PinataModule } from 'pinata/pinata.module';
import { ProgramModule } from './api/program/program.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    FarmerModule,
    FarmModule,
    ProduceModule,
    SubsidyModule,
    VerifyModule,
    RetailerModule,
    BlockchainModule,
    CloudinaryModule,
    PinataModule,
    ProgramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
