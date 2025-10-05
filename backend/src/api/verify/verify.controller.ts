import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { formatError } from 'src/common/helpers/error';
import { computeProduceHash } from 'src/common/helpers/hash';

@Controller('verify')
export class VerifyController {
  private readonly logger = new Logger(VerifyController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  // GET /verify/:batchId → verify authenticity of a produce batch
  @Get(':batchId')
  async verifyBatch(@Param('batchId') batchId: string) {
    try {
      // 1) Retrieve the produce record from DB (include farm for response data)
      const produce = await this.prisma.prisma.produce.findUnique({
        where: { batchId },
        include: { farm: true },
      });

      if (!produce) {
        throw new NotFoundException('Produce batch not found');
      }

      // 2) Compute SHA256 hash of the off-chain payload
      // Keep field order and values consistent with creation flow
      const offChainHash = computeProduceHash({
        batchId: produce.batchId,
        name: produce.name,
        harvestDate: produce.harvestDate,
        certifications: produce.certifications,
        farmId: produce.farmId,
      });

      // 3) Retrieve the on-chain hash
      const onChainHash = await this.blockchainService.getProduceHash(batchId);

      // 4) Compare
      const verified = offChainHash === onChainHash;

      console.log(
        `verifyBatch: ${batchId} offChainHash: ${offChainHash} onChainHash: ${onChainHash} verified: ${verified}`,
      );

      // 5) Return structured response
      return {
        verified,
        batchId: produce.batchId,
        produce: {
          name: produce.name,
          harvestDate: produce.harvestDate,
          certifications: produce.certifications,
          farm: produce.farm?.name,
        },
        blockchain: {
          onChainHash,
          offChainHash,
          blockchainTx: produce.blockchainTx as string,
          verified,
        },
      };
    } catch (e) {
      // Log for diagnostics, Nest will format thrown HTTP exceptions
      this.logger.error(`verifyBatch failed for ${batchId}: ${formatError(e)}`);
      throw e;
    }
  }
}
