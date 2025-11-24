import { Module } from '@nestjs/common';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PinataModule } from 'pinata/pinata.module';

@Module({
  imports: [PrismaModule, PinataModule],
  controllers: [FarmController],
  providers: [FarmService],
  exports: [FarmService],
})
export class FarmModule {}
