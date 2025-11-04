import { Module } from '@nestjs/common';
import { ProduceController } from './produce.controller';
import { ProduceService } from './produce.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProduceController],
  providers: [ProduceService, BlockchainService, CloudinaryService],
  exports: [ProduceService],
})
export class ProduceModule {}
