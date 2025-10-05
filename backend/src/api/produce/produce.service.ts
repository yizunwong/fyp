import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProduceDto } from './dto/create-produce.dto';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import * as crypto from 'crypto';
import QRCode from 'qrcode';

@Injectable()
export class ProduceService {
  private readonly logger = new Logger(ProduceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  private async ensureFarmerExists(farmerId: string) {
    const farmer = await this.prisma.prisma.user.findUnique({
      where: { id: farmerId },
    });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }
    return farmer;
  }

  async createProduce(farmerId: string, farmId: string, dto: CreateProduceDto) {
    await this.ensureFarmerExists(farmerId);
    const farm = await this.prisma.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });
    if (!farm) {
      throw new NotFoundException('Farm not found for this farmer');
    }

    let harvestDate: Date;
    try {
      harvestDate = new Date(dto.harvestDate);
      if (isNaN(harvestDate.getTime())) throw new Error('Invalid date');
    } catch {
      throw new BadRequestException('Invalid harvestDate');
    }

    // Create the off-chain payload and its SHA-256 hash
    const producePayload = JSON.stringify({
      batchId: dto.batchId,
      name: dto.name,
      harvestDate: dto.harvestDate,
      certifications: dto.certifications,
      farmId,
    });
    const produceHash = crypto
      .createHash('sha256')
      .update(producePayload)
      .digest('hex');

    // Build a verify URL for QR code, configurable via env
    const verifyBase =
      process.env.VERIFY_BASE_URL?.replace(/\/$/, '') ||
      'http://localhost:3000';
    const verifyUrl = `${verifyBase}/verify/${encodeURIComponent(dto.batchId)}`;
    const qrHash = crypto.createHash('sha256').update(verifyUrl).digest('hex');

    // Generate QR as Data URL to return to client
    const qrCodeDataUrl: string = await QRCode.toDataURL(verifyUrl);

    // First, create the produce in DB
    const produce = await this.prisma.prisma.produce
      .create({
        data: {
          farmId: farmId,
          name: dto.name,
          batchId: dto.batchId,
          harvestDate,
          certifications: dto.certifications ?? undefined,
        },
      })
      .catch((e) => {
        throw new BadRequestException('Failed to create produce', e as string);
      });

    // Then, attempt to record on blockchain and persist tx hash
    try {
      const txHash = await this.blockchainService.recordProduce(
        dto.batchId,
        produceHash,
        qrHash,
      );

      await this.prisma.prisma.produce.update({
        where: { id: produce.id },
        data: { blockchainTx: txHash },
      });

      return {
        ...produce,
        blockchainTx: txHash,
        qrCode: qrCodeDataUrl,
      };
    } catch (e) {
      this.logger.error(`Blockchain record failed: ${this.formatError(e)}`);
      // Re-throw to signal failure to caller
      throw new BadRequestException('Failed to record on blockchain');
    }
  }

  async listProduce(farmerId: string, farmId: string) {
    await this.ensureFarmerExists(farmerId);
    return this.prisma.prisma.produce.findMany({
      where: { farm: { farmerId, id: farmId } },
      include: { farm: true },
    });
  }

  private formatError(e: unknown): string {
    if (e instanceof Error) return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
}
