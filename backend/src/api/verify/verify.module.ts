import { Module } from '@nestjs/common';
import { VerifyController } from './verify.controller';
import { ProduceModule } from '../produce/produce.module';

@Module({
  imports: [ProduceModule],
  controllers: [VerifyController],
})
export class VerifyModule {}
