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
import * as fs from 'fs';
import * as path from 'path';
import { ensureFarmerExists } from 'src/common/helpers/farmer';
import { formatError } from 'src/common/helpers/error';
import { computeProduceHash } from 'src/common/helpers/hash';

@Injectable()
export class ProduceService {
  private readonly logger = new Logger(ProduceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createProduce(farmerId: string, farmId: string, dto: CreateProduceDto) {
    await ensureFarmerExists(this.prisma, farmerId);

    const farm = await this.prisma.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });
    if (!farm) throw new NotFoundException('Farm not found for this farmer');

    // 🗓️ Validate date
    let harvestDate: Date;
    try {
      harvestDate = new Date(dto.harvestDate);
      if (isNaN(harvestDate.getTime())) throw new Error('Invalid date');
    } catch {
      throw new BadRequestException('Invalid harvestDate');
    }

    // 🧮 Compute deterministic hash for blockchain
    const produceHash = computeProduceHash({
      batchId: dto.batchId,
      name: dto.name,
      harvestDate: dto.harvestDate,
      certifications: dto.certifications ?? null,
      farmId,
    });

    // 🔗 Generate verification URL for QR code
    const verifyBase =
      process.env.VERIFY_BASE_URL?.replace(/\/$/, '') ||
      'http://localhost:3000';
    const verifyUrl = `${verifyBase}/verify/${encodeURIComponent(dto.batchId)}`;
    const qrHash = crypto.createHash('sha256').update(verifyUrl).digest('hex');

    // 🖼️ Generate QR Code as Base64 for frontend display
    const qrCodeDataUrl: string = await QRCode.toDataURL(verifyUrl);

    // 💾 Generate and save QR Code image file (PNG)
    try {
      const qrDir = path.resolve(process.cwd(), 'uploads', 'qrcodes');
      if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

      const fileName = `${dto.batchId}_${Date.now()}.png`;
      const filePath = path.join(qrDir, fileName);

      await QRCode.toFile(filePath, verifyUrl, {
        width: 400,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      this.logger.log(`✅ QR code image saved at: ${filePath}`);
    } catch (qrErr) {
      this.logger.error(
        `⚠️ Failed to save QR code image: ${formatError(qrErr)}`,
      );
      // Do not throw — QR image generation failure shouldn't block the process
    }

    // 🧾 Create produce record in DB
    const produce = await this.prisma.prisma.produce
      .create({
        data: {
          farmId: farmId,
          name: dto.name,
          batchId: dto.batchId,
          harvestDate,
          category: dto.category,
          certifications: dto.certifications ?? undefined,
        },
      })
      .catch((e) => {
        this.logger.error(`createProduce error: ${formatError(e)}`);
        throw new BadRequestException('Failed to create produce');
      });

    // ⛓️ Record on blockchain + update DB with tx hash
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
        message:
          'Produce recorded successfully with QR code and blockchain proof.',
      };
    } catch (e) {
      this.logger.error(`Blockchain record failed: ${formatError(e)}`);
      throw new BadRequestException('Failed to record on blockchain');
    }
  }

  async listProduce(farmerId: string, farmId: string) {
    await ensureFarmerExists(this.prisma, farmerId);
    return this.prisma.prisma.produce.findMany({
      where: { farm: { farmerId, id: farmId } },
      include: { farm: true },
    });
  }
}
