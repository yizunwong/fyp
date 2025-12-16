import { Module } from '@nestjs/common';
import { FarmerService } from './farmer.service';
import { FarmerController } from './farmer.controller';
import { FarmController } from '../farm/farm.controller';
import { FarmService } from '../farm/farm.service';
import { ProduceController } from '../produce/produce.controller';
import { ProduceService } from '../produce/produce.service';
import { SubsidyController } from '../subsidy/subsidy.controller';
import { SubsidyService } from '../subsidy/subsidy.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PinataModule } from 'pinata/pinata.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    PinataModule,
    BlockchainModule,
    CloudinaryModule,
    NotificationModule,
  ],
  controllers: [
    FarmerController,
    FarmController,
    ProduceController,
    SubsidyController,
  ],
  providers: [
    FarmerService,
    FarmService,
    ProduceService,
    SubsidyService,
    BlockchainService,
    CloudinaryService,
  ],
})
export class FarmerModule {}
