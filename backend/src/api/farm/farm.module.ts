import { Module } from '@nestjs/common';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PinataModule } from 'pinata/pinata.module';
import { ProduceModule } from '../produce/produce.module';

@Module({
  imports: [PrismaModule, PinataModule, ProduceModule],
  controllers: [FarmController],
  providers: [FarmService],
  exports: [FarmService],
})
export class FarmModule {}
