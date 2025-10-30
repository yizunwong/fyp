import { Module } from '@nestjs/common';
import { RetailerController } from './retailer.controller';
import { ProduceModule } from '../produce/produce.module';

@Module({
  imports: [ProduceModule],
  controllers: [RetailerController],
})
export class RetailerModule {}
