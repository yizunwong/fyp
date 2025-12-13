import { Module } from '@nestjs/common';
import { RetailerController } from './retailer.controller';
import { ProduceModule } from '../produce/produce.module';
import { RetailerService } from './retailer.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ProduceModule, PrismaModule],
  controllers: [RetailerController],
  providers: [RetailerService],
})
export class RetailerModule {}
