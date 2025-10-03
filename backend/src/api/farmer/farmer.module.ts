import { Module } from '@nestjs/common';
import { FarmerService } from './farmer.service';
import { FarmerController } from './farmer.controller';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { ProduceController } from './produce.controller';
import { ProduceService } from './produce.service';
import { SubsidyController } from './subsidy.controller';
import { SubsidyService } from './subsidy.service';

@Module({
  controllers: [
    FarmerController,
    FarmController,
    ProduceController,
    SubsidyController,
  ],
  providers: [FarmerService, FarmService, ProduceService, SubsidyService],
})
export class FarmerModule {}
