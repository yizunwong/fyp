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

@Module({
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
  ],
})
export class FarmerModule {}
