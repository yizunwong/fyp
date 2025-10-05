import { Module } from '@nestjs/common';
import { VerifyController } from './verify.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Module({
  controllers: [VerifyController],
  providers: [PrismaService, BlockchainService],
})
export class VerifyModule {}
