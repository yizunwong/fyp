import { Module } from '@nestjs/common';
import { ProduceController } from './produce.controller';
import { ProduceService } from './produce.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  controllers: [ProduceController],
  providers: [ProduceService],
  exports: [ProduceService],
})
export class ProduceModule {}
