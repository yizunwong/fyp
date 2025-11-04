import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import QRCode from 'qrcode';
import { ProduceStatus, Role, type Prisma } from '@prisma/client';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { formatError } from 'src/common/helpers/error';
import { ensureFarmerExists } from 'src/common/helpers/farmer';
import { computeProduceHash } from 'src/common/helpers/hash';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProduceDto } from './dto/create-produce.dto';
import { CreateProduceResponseDto } from './dto/responses/create-produce.dto';
import { VerifyProduceResponseDto } from '../verify/responses/verify.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const DEFAULT_CONFIRMATION_POLL_MS = 60_000;

interface ActorContext {
  id: string;
  role: Role;
}

type ProduceWithFarm = Prisma.ProduceGetPayload<{ include: { farm: true } }>;

interface VerificationSnapshot {
  offChainHash: string;
  onChainHash: string;
}

@Injectable()
export class ProduceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProduceService.name);
  private confirmationInterval?: NodeJS.Timeout;
  private static readonly allowedTransitions: Record<
    ProduceStatus,
    ProduceStatus[]
  > = {
    [ProduceStatus.DRAFT]: [ProduceStatus.PENDING_CHAIN],
    [ProduceStatus.PENDING_CHAIN]: [ProduceStatus.ONCHAIN_CONFIRMED],
    [ProduceStatus.ONCHAIN_CONFIRMED]: [
      ProduceStatus.IN_TRANSIT,
      ProduceStatus.VERIFIED,
      ProduceStatus.ARCHIVED,
    ],
    [ProduceStatus.IN_TRANSIT]: [ProduceStatus.VERIFIED],
    [ProduceStatus.VERIFIED]: [ProduceStatus.ARCHIVED],
    [ProduceStatus.ARCHIVED]: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  onModuleInit() {
    const intervalMs = Number(
      process.env.PRODUCE_CONFIRMATION_POLL_INTERVAL_MS ??
        DEFAULT_CONFIRMATION_POLL_MS,
    );
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
      this.logger.warn(
        'Produce confirmation poll disabled (invalid interval configuration).',
      );
      return;
    }

    this.confirmationInterval = setInterval(() => {
      this.pollPendingProduces().catch((error) => {
        this.logger.error(
          `Failed to poll pending produce confirmations: ${formatError(error)}`,
        );
      });
    }, intervalMs);
    this.confirmationInterval.unref?.();
    this.logger.log(
      `Produce confirmation poll scheduled every ${intervalMs}ms.`,
    );
  }

  onModuleDestroy() {
    if (this.confirmationInterval) {
      clearInterval(this.confirmationInterval);
    }
  }

  private canTransition(current: ProduceStatus, next: ProduceStatus): boolean {
    return ProduceService.allowedTransitions[current]?.includes(next) ?? false;
  }

  private buildTransitionError(from: ProduceStatus, to: ProduceStatus): string {
    return `Invalid status transition: ${from} \u2192 ${to}`;
  }

  private async applyTransition(
    produceId: string,
    current: ProduceStatus,
    next: ProduceStatus,
    extraData: Prisma.ProduceUncheckedUpdateInput = {},
  ): Promise<void> {
    if (!this.canTransition(current, next)) {
      throw new BadRequestException(this.buildTransitionError(current, next));
    }

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.produce.findUnique({
        where: { id: produceId },
        select: { status: true },
      });

      if (!existing) {
        throw new NotFoundException('Produce not found');
      }

      if (existing.status !== current) {
        throw new BadRequestException(
          this.buildTransitionError(existing.status, next),
        );
      }

      await tx.produce.update({
        where: { id: produceId },
        data: { ...extraData, status: next },
      });
    });
  }

  async createProduce(
    farmerId: string,
    farmId: string,
    dto: CreateProduceDto,
  ): Promise<CreateProduceResponseDto> {
    await ensureFarmerExists(this.prisma, farmerId);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });
    if (!farm) throw new NotFoundException('Farm not found for this farmer');

    let harvestDate: Date;
    try {
      harvestDate = new Date(dto.harvestDate);
      if (isNaN(harvestDate.getTime())) throw new Error('Invalid date');
    } catch {
      throw new BadRequestException('Invalid harvestDate');
    }

    const produceHash = computeProduceHash({
      batchId: dto.batchId,
      name: dto.name,
      harvestDate: dto.harvestDate,
      certifications: dto.certifications ?? null,
      farmId,
    });

    const verifyBase =
      process.env.VERIFY_BASE_URL?.replace(/\/$/, '') ||
      'http://localhost:8081';
    const verifyUrl = `${verifyBase}/verify/${encodeURIComponent(dto.batchId)}`;
    const qrHash = crypto.createHash('sha256').update(verifyUrl).digest('hex');
    const qrCodeDataUrl: string = await QRCode.toDataURL(verifyUrl);

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

      // this.cloudinaryService.uploadImage(qrImage);

      this.logger.log(`QR code image saved at: ${filePath}`);
    } catch (qrErr) {
      this.logger.error(`Failed to save QR code image: ${formatError(qrErr)}`);
    }

    const isPublicQR = dto.isPublicQR ?? true;

    const produce = await this.prisma.produce
      .create({
        data: {
          farmId,
          name: dto.name,
          batchId: dto.batchId,
          quantity: dto.quantity,
          unit: dto.unit,
          harvestDate,
          category: dto.category,
          certifications: dto.certifications ?? undefined,
          status: ProduceStatus.DRAFT,
          isPublicQR,
        },
      })
      .catch((e) => {
        this.logger.error(`createProduce error: ${formatError(e)}`);
        throw new BadRequestException('Failed to create produce');
      });

    let txHash: string | null = null;
    let currentStatus = produce.status;

    try {
      txHash = await this.blockchainService.recordProduce(
        dto.batchId,
        produceHash,
        qrHash,
      );

      await this.applyTransition(
        produce.id,
        currentStatus,
        ProduceStatus.PENDING_CHAIN,
        { blockchainTx: txHash },
      );
      currentStatus = ProduceStatus.PENDING_CHAIN;

      let confirmed = false;
      try {
        confirmed = txHash
          ? await this.blockchainService.confirmOnChain(txHash)
          : false;
      } catch (confirmErr) {
        this.logger.warn(
          `Unable to confirm on-chain status for tx ${txHash}: ${formatError(
            confirmErr,
          )}`,
        );
      }

      if (confirmed) {
        await this.applyTransition(
          produce.id,
          ProduceStatus.PENDING_CHAIN,
          ProduceStatus.ONCHAIN_CONFIRMED,
        );
        currentStatus = ProduceStatus.ONCHAIN_CONFIRMED;
      }
    } catch (e) {
      this.logger.error(`Blockchain record failed: ${formatError(e)}`);
      throw new BadRequestException('Failed to record on blockchain');
    }

    const latest = await this.prisma.produce.findUnique({
      where: { id: produce.id },
    });
    const record = latest ?? produce;

    const finalStatus = record.status ?? currentStatus;
    const message =
      finalStatus === ProduceStatus.ONCHAIN_CONFIRMED
        ? 'Produce recorded successfully on-chain with QR code and blockchain proof.'
        : 'Produce queued for on-chain confirmation with QR code and blockchain proof.';

    return new CreateProduceResponseDto({
      id: record.id,
      farmId: record.farmId,
      name: record.name,
      category: record.category,
      batchId: record.batchId,
      quantity: record.quantity,
      unit: record.unit,
      harvestDate: record.harvestDate,
      certifications: record.certifications ?? null,
      status: finalStatus,
      blockchainTx: record.blockchainTx ?? txHash ?? null,
      isPublicQR: record.isPublicQR,
      retailerId: record.retailerId ?? null,
      createdAt: record.createdAt,
      qrCode: qrCodeDataUrl,
      message,
    });
  }

  async assignRetailer(
    produceId: string,
    retailerId: string,
    actor: ActorContext,
  ) {
    const produce = await this.prisma.produce.findUnique({
      where: { id: produceId },
      include: { farm: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce not found');
    }

    if (
      actor.role !== Role.ADMIN &&
      produce.farm?.farmerId &&
      produce.farm.farmerId !== actor.id
    ) {
      throw new ForbiddenException('Produce does not belong to this farmer');
    }

    if (produce.status !== ProduceStatus.ONCHAIN_CONFIRMED) {
      throw new BadRequestException(
        'Only on-chain confirmed produce can be assigned to a retailer',
      );
    }

    const retailer = await this.prisma.user.findUnique({
      where: { id: retailerId },
    });

    if (!retailer || retailer.role !== Role.RETAILER) {
      throw new BadRequestException('Retailer does not exist or is invalid');
    }

    await this.applyTransition(
      produce.id,
      produce.status,
      ProduceStatus.IN_TRANSIT,
      { retailerId },
    );

    const updated = await this.prisma.produce.findUnique({
      where: { id: produceId },
      include: { retailer: true },
    });

    this.logger.log(
      `Produce ${produce.batchId} assigned to retailer ${retailerId} by actor ${actor.id}`,
    );

    return updated;
  }

  async archiveProduce(produceId: string, actor: ActorContext) {
    const produce = await this.prisma.produce.findUnique({
      where: { id: produceId },
      include: { farm: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce not found');
    }

    if (
      actor.role !== Role.ADMIN &&
      produce.farm?.farmerId &&
      produce.farm.farmerId !== actor.id
    ) {
      throw new ForbiddenException('Produce does not belong to this farmer');
    }

    if (
      produce.status !== ProduceStatus.VERIFIED &&
      produce.status !== ProduceStatus.ONCHAIN_CONFIRMED
    ) {
      throw new BadRequestException(
        'Only verified or confirmed produce can be archived',
      );
    }

    await this.applyTransition(
      produce.id,
      produce.status,
      ProduceStatus.ARCHIVED,
    );

    const updated = await this.prisma.produce.findUnique({
      where: { id: produceId },
    });

    this.logger.log(`Produce ${produce.batchId} archived by actor ${actor.id}`);

    return updated;
  }

  private async getVerificationContext(batchId: string): Promise<{
    produce: ProduceWithFarm;
    offChainHash: string;
    onChainHash: string;
    verified: boolean;
  }> {
    const produce = await this.prisma.produce.findUnique({
      where: { batchId },
      include: { farm: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce batch not found');
    }

    const offChainHash = computeProduceHash({
      batchId: produce.batchId,
      name: produce.name,
      harvestDate: produce.harvestDate,
      certifications: produce.certifications,
      farmId: produce.farmId,
    });

    const onChainHash = await this.blockchainService.getProduceHash(batchId);
    const verified = offChainHash === onChainHash;

    return { produce, offChainHash, onChainHash, verified };
  }

  private buildVerificationResponse(
    produce: ProduceWithFarm,
    snapshot: VerificationSnapshot,
  ) {
    return new VerifyProduceResponseDto({
      batchId: produce.batchId,
      status: produce.status,
      isPublicQR: produce.isPublicQR,
      produce: {
        name: produce.name,
        harvestDate: produce.harvestDate,
        certifications: produce.certifications,
        farm: produce.farm?.name,
      },
      blockchain: {
        onChainHash: snapshot.onChainHash,
        offChainHash: snapshot.offChainHash,
        blockchainTx: produce.blockchainTx,
      },
    });
  }

  async verifyProduce(batchId: string) {
    const context = await this.getVerificationContext(batchId);
    const { produce } = context;
    if (!produce.isPublicQR) {
      throw new ForbiddenException(
        'Public verification is disabled for this batch',
      );
    }

    const snapshot: VerificationSnapshot = {
      offChainHash: context.offChainHash,
      onChainHash: context.onChainHash,
    };

    return this.buildVerificationResponse(produce, snapshot);
  }

  async retailerVerifyProduce(batchId: string, actor: ActorContext) {
    if (actor.role !== Role.RETAILER) {
      throw new ForbiddenException(
        'Only retailers can confirm produce receipt',
      );
    }

    const context = await this.getVerificationContext(batchId);
    const { produce } = context;
    const snapshot: VerificationSnapshot = {
      offChainHash: context.offChainHash,
      onChainHash: context.onChainHash,
    };

    if (!produce.retailerId || produce.retailerId !== actor.id) {
      throw new ForbiddenException(
        'Produce batch is not assigned to this retailer',
      );
    }

    if (!snapshot.offChainHash !== !snapshot.onChainHash) {
      throw new BadRequestException(
        'Blockchain record mismatch; cannot mark as verified',
      );
    }

    if (produce.status === ProduceStatus.VERIFIED) {
      return this.buildVerificationResponse(produce, snapshot);
    }

    if (produce.status !== ProduceStatus.IN_TRANSIT) {
      throw new BadRequestException(
        'Produce batch is not pending retailer verification',
      );
    }

    await this.applyTransition(
      produce.id,
      produce.status,
      ProduceStatus.VERIFIED,
    );

    const updated = await this.prisma.produce.findUnique({
      where: { id: produce.id },
      include: { farm: true },
    });

    if (!updated) {
      throw new NotFoundException('Produce batch not found');
    }

    this.logger.log(
      `Produce ${produce.batchId} verified by retailer ${actor.id}`,
    );

    return this.buildVerificationResponse(updated, snapshot);
  }

  async listProduce(farmerId: string) {
    await ensureFarmerExists(this.prisma, farmerId);
    return this.prisma.produce.findMany({
      where: { farm: { farmerId } },
      include: { retailer: true },
    });
  }

  private async pollPendingProduces() {
    const pending = await this.prisma.produce.findMany({
      where: {
        status: ProduceStatus.PENDING_CHAIN,
        blockchainTx: { not: null },
      },
      take: 10,
    });

    for (const produce of pending) {
      if (!produce.blockchainTx) continue;

      let confirmed = false;
      try {
        confirmed = await this.blockchainService.confirmOnChain(
          produce.blockchainTx,
        );
      } catch (error) {
        this.logger.warn(
          `Unable to confirm on-chain status for tx ${produce.blockchainTx}: ${formatError(
            error,
          )}`,
        );
      }

      if (confirmed) {
        try {
          await this.applyTransition(
            produce.id,
            ProduceStatus.PENDING_CHAIN,
            ProduceStatus.ONCHAIN_CONFIRMED,
          );
          this.logger.log(
            `Produce ${produce.id} (${produce.batchId}) confirmed on-chain.`,
          );
        } catch (transitionErr) {
          this.logger.warn(
            `Skipping status update for produce ${produce.id}: ${formatError(
              transitionErr,
            )}`,
          );
        }
      }
    }
  }
}
