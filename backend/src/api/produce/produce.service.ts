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
import QRCode from 'qrcode';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { formatError } from 'src/common/helpers/error';
import { ensureFarmerExists } from 'src/common/helpers/farmer';
import { computeProduceHash } from 'src/common/helpers/hash';
import { PrismaService } from 'src/prisma/prisma.service';
import { PinataService } from 'pinata/pinata.service';
import { CreateProduceDto } from './dto/create-produce.dto';
import { CreateProduceResponseDto } from './dto/responses/create-produce.dto';
import { VerifyProduceResponseDto } from '../verify/responses/verify.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  CertificationType,
  Prisma,
  ProduceStatus,
  Role,
} from 'prisma/generated/prisma/client';
import { ListProduceQueryDto } from './dto/list-produce-query.dto';

const DEFAULT_CONFIRMATION_POLL_MS = 60_000;

interface UserContext {
  id: string;
  role: Role;
}

type ProduceWithFarm = Prisma.ProduceGetPayload<{
  include: { farm: true; qrCode: true; certifications: true };
}>;

interface VerificationSnapshot {
  offChainHash: string;
  onChainHash: string;
}

type CertificationDocumentLike = {
  name: string;
  mimeType: string | null;
  size: number | null;
  kind: string | null;
  certificateType: CertificationType | null;
};

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
      ProduceStatus.ARCHIVED,
    ],
    [ProduceStatus.IN_TRANSIT]: [ProduceStatus.ARRIVED],
    [ProduceStatus.ARRIVED]: [ProduceStatus.RETAILER_VERIFIED],
    [ProduceStatus.RETAILER_VERIFIED]: [ProduceStatus.ARCHIVED],
    [ProduceStatus.ARCHIVED]: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly pinataService: PinataService,
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

  private selectFarmSummary() {
    return {
      select: {
        id: true,
        name: true,
        address: true,
        state: true,
        district: true,
        rating: true,
        ratingCount: true,
      },
    } as const;
  }

  private normalizeCertificationsFromDto(
    rawCertifications: unknown,
  ): CertificationDocumentLike[] {
    const documents = (rawCertifications as { documents?: unknown })?.documents;
    if (!Array.isArray(documents)) return [];

    return documents.map((doc) => ({
      name: (doc as { name?: string })?.name ?? '',
      mimeType: (doc as { mimeType?: string })?.mimeType ?? null,
      size:
        typeof (doc as { size?: number })?.size === 'number'
          ? ((doc as { size?: number })?.size ?? null)
          : null,
      kind: (doc as { kind?: string })?.kind ?? null,
      certificateType:
        (doc as { certificateType?: CertificationType })?.certificateType ??
        null,
    }));
  }

  private normalizeCertificationsFromEntities(
    certifications: Array<{
      fileName: string | null;
      mimeType: string | null;
      fileSize: number | null;
      type: CertificationType;
    }>,
  ): CertificationDocumentLike[] {
    return certifications.map((cert) => ({
      name: cert.fileName ?? '',
      mimeType: cert.mimeType ?? null,
      size: cert.fileSize ?? null,
      kind: cert.mimeType?.startsWith('image/') ? 'image' : 'document',
      certificateType: cert.type ?? null,
    }));
  }

  private buildCertificationHashPayload(
    documents: CertificationDocumentLike[],
  ): Prisma.JsonValue {
    const normalized = documents
      .map((doc) => ({
        name: doc.name ?? '',
        mimeType: doc.mimeType ?? null,
        size: typeof doc.size === 'number' ? doc.size : null,
        kind: doc.kind ?? null,
        certificateType: doc.certificateType ?? null,
      }))
      .sort((a, b) => {
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
        const typeCompare = (a.certificateType ?? '').localeCompare(
          b.certificateType ?? '',
        );
        if (typeCompare !== 0) return typeCompare;
        const mimeCompare = (a.mimeType ?? '').localeCompare(b.mimeType ?? '');
        if (mimeCompare !== 0) return mimeCompare;
        return (a.size ?? 0) - (b.size ?? 0);
      });

    return { documents: normalized } as Prisma.JsonValue;
  }

  private buildCertificationDocuments(
    certifications: Array<{
      id: string;
      fileName: string | null;
      ipfsUrl: string;
      mimeType: string | null;
      fileSize: number | null;
      type: CertificationType;
      verifiedOnChain: boolean;
      issuedAt: Date | null;
      metadata: Prisma.JsonValue | null;
    }>,
  ): Prisma.JsonValue {
    const documents = certifications
      .map((cert) => ({
        id: cert.id,
        name: cert.fileName ?? cert.id,
        uri: cert.ipfsUrl,
        mimeType: cert.mimeType ?? null,
        size: cert.fileSize ?? null,
        kind: cert.mimeType?.startsWith('image/') ? 'image' : 'document',
        certificateType: cert.type,
        verifiedOnChain: cert.verifiedOnChain,
        issuedAt: cert.issuedAt ? cert.issuedAt.toISOString() : null,
        metadata: cert.metadata ?? null,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

    return { documents } as Prisma.JsonValue;
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

  private async uploadProduceImage(file: Express.Multer.File): Promise<string> {
    try {
      const upload = await this.cloudinaryService.uploadImage(
        file.buffer,
        'produce-images',
      );
      this.logger.log(`Uploaded produce image: ${upload.url}`);
      return upload.url;
    } catch (err) {
      this.logger.error(`Failed to upload produce image: ${formatError(err)}`);
      throw new BadRequestException('Failed to upload produce image');
    }
  }

  async updateProduceImage(
    produceId: string,
    file: Express.Multer.File | undefined,
    user: UserContext,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const produce = await this.prisma.produce.findUnique({
      where: { id: produceId },
      include: { farm: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce not found');
    }

    const imageUrl = await this.uploadProduceImage(file);
    const updated = await this.prisma.produce.update({
      where: { id: produceId },
      data: { imageUrl },
    });

    this.logger.log(
      `Produce ${produce.batchId} image updated by user ${user.id}`,
    );

    return updated;
  }

  async uploadCertificates(
    produceId: string,
    files: Express.Multer.File[] | undefined,
    types: CertificationType[] | undefined, // <-- changed
    user: UserContext,
  ) {
    const typeList: CertificationType[] = Array.isArray(types)
      ? types
      : types
        ? [types]
        : [];

    if (!files?.length) {
      throw new BadRequestException(
        'At least one certificate file is required',
      );
    }

    if (!typeList.length || typeList.length !== files.length) {
      throw new BadRequestException(
        'Each uploaded certificate must have a corresponding type',
      );
    }

    const produce = await this.prisma.produce.findUnique({
      where: { id: produceId },
      include: { farm: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce not found');
    }

    if (
      user.role !== Role.ADMIN &&
      produce.farm?.farmerId &&
      produce.farm.farmerId !== user.id
    ) {
      throw new ForbiddenException('Produce does not belong to this farmer');
    }

    // Upload each file with its corresponding type
    const uploads = await Promise.all(
      files.map(async (file, index) => {
        const certificateType = typeList[index] ?? CertificationType.ORGANIC;

        const ipfsHash = await this.pinataService.uploadProduceCertificate(
          file,
          {
            produceId,
            userId: user.id,
            certificateType,
          },
        );

        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

        return { file, ipfsHash, ipfsUrl, certificateType };
      }),
    );

    // Save all certificates in a transaction
    const createdCertificates = await this.prisma.$transaction(
      uploads.map((upload) =>
        this.prisma.produceCertificate.create({
          data: {
            produceId,
            type: upload.certificateType,
            ipfsUrl: upload.ipfsUrl,
            fileName: upload.file.originalname,
            mimeType: upload.file.mimetype,
            fileSize: upload.file.size,
            metadata: {
              fieldName: upload.file.fieldname,
              ipfsHash: upload.ipfsHash,
            } as Prisma.InputJsonValue,
          },
        }),
      ),
    );

    this.logger.log(
      `Uploaded ${createdCertificates.length} certificates for produce ${produce.batchId} by user ${user.id}`,
    );

    return createdCertificates;
  }

  private async generateProduceQr(batchId: string): Promise<{
    qrCodeDataUrl: string;
    verifyUrl: string;
    qrHash: string;
    qrImageUrl: string;
  }> {
    try {
      const verifyBase =
        process.env.VERIFY_BASE_URL?.replace(/\/$/, '') ||
        'http://localhost:8081';
      const verifyUrl = `${verifyBase}/verify/${encodeURIComponent(batchId)}`;
      const qrHash = crypto
        .createHash('sha256')
        .update(verifyUrl)
        .digest('hex');
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

      const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 400 });
      const upload = await this.cloudinaryService.uploadImage(
        qrBuffer,
        'produce-qr-codes',
      );
      this.logger.log(`Uploaded QR code: ${upload.url}`);

      this.logger.log(`Generated QR code for batch ${batchId}: ${qrHash}`);

      return { qrCodeDataUrl, verifyUrl, qrHash, qrImageUrl: upload.url };
    } catch (err) {
      this.logger.error(`Failed to generate QR code: ${formatError(err)}`);
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  async createProduce(
    farmerId: string,
    farmId: string,
    dto: CreateProduceDto,
  ): Promise<CreateProduceResponseDto> {
    await ensureFarmerExists(this.prisma, farmerId);
    console.log('Creating produce with DTO:', dto.batchId);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });
    if (!farm) throw new NotFoundException('Farm not found for this farmer');

    const harvestDate = new Date(dto.harvestDate);

    const { qrCodeDataUrl, verifyUrl, qrHash, qrImageUrl } =
      await this.generateProduceQr(dto.batchId);

    console.log(dto.certifications);

    const certificationsPayload = this.buildCertificationHashPayload(
      this.normalizeCertificationsFromDto(dto.certifications),
    );

    const produceHash = computeProduceHash({
      batchId: dto.batchId,
      name: dto.name,
      harvestDate: dto.harvestDate,
      certifications: certificationsPayload,
      farmId,
    });

    let txHash: string;
    try {
      this.logger.log(`Recording produce on blockchain: ${produceHash}`);
      txHash = await this.blockchainService.recordProduce(
        dto.batchId,
        produceHash,
        qrHash,
      );
    } catch (err) {
      this.logger.error(
        `Blockchain record failed before saving produce: ${formatError(err)}`,
      );
      throw new BadRequestException('Failed to record on blockchain');
    }

    const produce = await this.prisma.$transaction(async (tx) => {
      const created = await tx.produce.create({
        data: {
          farmId,
          name: dto.name,
          batchId: dto.batchId,
          quantity: dto.quantity,
          unit: dto.unit,
          harvestDate,
          category: dto.category,
          status: ProduceStatus.PENDING_CHAIN,
          blockchainTx: txHash,
        },
      });

      await tx.qRCode.create({
        data: {
          produceId: created.id,
          verifyUrl: verifyUrl,
          qrHash: qrHash,
          imageUrl: qrImageUrl,
        },
      });

      return created;
    });

    let currentStatus = produce.status;

    let confirmed = false;
    try {
      confirmed = txHash
        ? await this.blockchainService.confirmOnChain(txHash)
        : false;
    } catch (confirmErr) {
      this.logger.warn(
        `Unable to confirm on-chain tx ${txHash}: ${formatError(confirmErr)}`,
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

    // --- Step 6: Return final produce data ---
    const latest = await this.prisma.produce.findUnique({
      where: { id: produce.id },
    });
    const record = latest ?? produce;

    const message =
      currentStatus === ProduceStatus.ONCHAIN_CONFIRMED
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
      status: currentStatus,
      blockchainTx: record.blockchainTx ?? txHash ?? null,
      retailerId: record.retailerId ?? null,
      createdAt: record.createdAt,
      qrCode: qrCodeDataUrl,
      message,
    });
  }

  async assignRetailer(
    produceId: string,
    retailerId: string,
    user: UserContext,
  ) {
    const produce = await this.prisma.produce.findUnique({
      where: { id: produceId },
      include: { farm: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce not found');
    }

    if (
      user.role !== Role.ADMIN &&
      produce.farm?.farmerId &&
      produce.farm.farmerId !== user.id
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
      `Produce ${produce.batchId} assigned to retailer ${retailerId} by user ${user.id}`,
    );

    return updated;
  }

  async markProduceArrival(batchId: string, retailerId: string) {
    const produce = await this.prisma.produce.findUnique({
      where: { batchId },
      include: { retailer: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce batch not found');
    }

    if (!produce.retailerId || produce.retailerId !== retailerId) {
      throw new ForbiddenException(
        'Produce batch is not assigned to this retailer',
      );
    }

    if (produce.status !== ProduceStatus.IN_TRANSIT) {
      throw new BadRequestException(
        'Arrival can only be recorded when the batch is in transit',
      );
    }

    await this.applyTransition(
      produce.id,
      ProduceStatus.IN_TRANSIT,
      ProduceStatus.ARRIVED,
    );

    const updated = await this.prisma.produce.findUnique({
      where: { id: produce.id },
      include: { retailer: true },
    });

    this.logger.log(
      `Produce ${produce.batchId} marked as arrived by retailer ${retailerId}`,
    );

    return updated;
  }

  async archiveProduce(produceId: string, user: UserContext) {
    const produce = await this.prisma.produce.findUnique({
      where: { id: produceId },
      include: { farm: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce not found');
    }

    if (
      user.role !== Role.ADMIN &&
      produce.farm?.farmerId &&
      produce.farm.farmerId !== user.id
    ) {
      throw new ForbiddenException('Produce does not belong to this farmer');
    }

    if (
      produce.status !== ProduceStatus.RETAILER_VERIFIED &&
      produce.status !== ProduceStatus.ONCHAIN_CONFIRMED
    ) {
      throw new BadRequestException(
        'Only retailer-verified or confirmed produce can be archived',
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

    this.logger.log(`Produce ${produce.batchId} archived by user ${user.id}`);

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
      include: { farm: true, qrCode: true, certifications: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce batch not found');
    }

    console.log(
      'Produce found for verification:',
      this.buildCertificationHashPayload(
        this.normalizeCertificationsFromEntities(produce.certifications ?? []),
      ),
    );

    const offChainHash = computeProduceHash({
      batchId: produce.batchId,
      name: produce.name,
      harvestDate: produce.harvestDate,
      certifications: this.buildCertificationHashPayload(
        this.normalizeCertificationsFromEntities(produce.certifications ?? []),
      ),
      farmId: produce.farmId,
    });

    const onChainRaw = await this.blockchainService.getProduceHash(batchId);
    const normalizeHash = (hash: string) =>
      hash.replace(/^0x/i, '').toLowerCase();
    const onChainHash = normalizeHash(onChainRaw || '');
    const normalizedOffChain = normalizeHash(offChainHash || '');
    const verified = normalizedOffChain === onChainHash;

    return {
      produce,
      offChainHash: normalizedOffChain,
      onChainHash,
      verified,
    };
  }

  private buildVerificationResponse(
    produce: ProduceWithFarm,
    snapshot: VerificationSnapshot,
  ) {
    return new VerifyProduceResponseDto({
      batchId: produce.batchId,
      status: produce.status,
      isPublicQR: produce.qrCode?.isPublicQR ?? true,
      produce: {
        name: produce.name,
        harvestDate: produce.harvestDate,
        farm: produce.farm?.name,
        certifications: this.buildCertificationDocuments(
          produce.certifications ?? [],
        ),
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
    if (!produce.qrCode?.isPublicQR) {
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

  async retailerVerifyProduce(batchId: string, id: string) {
    const context = await this.getVerificationContext(batchId);
    const { produce } = context;
    const snapshot: VerificationSnapshot = {
      offChainHash: context.offChainHash,
      onChainHash: context.onChainHash,
    };

    if (!produce.retailerId || produce.retailerId !== id) {
      throw new ForbiddenException(
        'Produce batch is not assigned to this retailer',
      );
    }

    if (!snapshot.onChainHash) {
      throw new BadRequestException(
        'Blockchain record missing; cannot mark as verified',
      );
    }

    if (snapshot.offChainHash !== snapshot.onChainHash) {
      throw new BadRequestException(
        'Off-chain data does not match blockchain record; cannot verify batch',
      );
    }

    if (produce.status === ProduceStatus.RETAILER_VERIFIED) {
      return this.buildVerificationResponse(produce, snapshot);
    }

    if (produce.status !== ProduceStatus.ARRIVED) {
      throw new BadRequestException(
        'Produce batch must be marked as arrived before verification',
      );
    }

    await this.applyTransition(
      produce.id,
      ProduceStatus.ARRIVED,
      ProduceStatus.RETAILER_VERIFIED,
    );

    const updated = await this.prisma.produce.findUnique({
      where: { id: produce.id },
      include: { farm: true, qrCode: true, certifications: true },
    });

    if (!updated) {
      throw new NotFoundException('Produce batch not found');
    }

    this.logger.log(`Produce ${produce.batchId} verified by retailer ${id}`);

    return this.buildVerificationResponse(updated, snapshot);
  }

  async listProduce(farmerId: string, params?: ListProduceQueryDto) {
    await ensureFarmerExists(this.prisma, farmerId);
    const where = {
      ...this.buildProduceWhere(params),
      farm: { farmerId },
    };
    const pagination = this.buildPagination(params);

    return this.prisma.produce.findMany({
      where,
      include: {
        retailer: true,
        qrCode: true,
        certifications: true,
      },
      orderBy: { createdAt: 'desc' },
      ...pagination,
    });
  }

  private buildProduceWhere(
    params?: ListProduceQueryDto,
  ): Prisma.ProduceWhereInput {
    const where: Prisma.ProduceWhereInput = {};

    if (params?.status) {
      where.status = params.status;
    }

    const search = params?.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { batchId: { contains: search, mode: 'insensitive' } },
        { farm: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const harvestFrom = params?.harvestFrom
      ? new Date(params.harvestFrom)
      : undefined;
    const harvestTo = params?.harvestTo
      ? new Date(params.harvestTo)
      : undefined;

    if (
      (harvestFrom && !isNaN(harvestFrom.getTime())) ||
      (harvestTo && !isNaN(harvestTo.getTime()))
    ) {
      where.harvestDate = {};
      if (harvestFrom && !isNaN(harvestFrom.getTime())) {
        where.harvestDate.gte = harvestFrom;
      }
      if (harvestTo && !isNaN(harvestTo.getTime())) {
        where.harvestDate.lte = harvestTo;
      }
    }

    return where;
  }

  private buildPagination(params?: ListProduceQueryDto) {
    const defaultLimit = 20;
    const maxLimit = 100;
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit =
      params?.limit && params.limit > 0
        ? Math.min(params.limit, maxLimit)
        : defaultLimit;

    return {
      take: limit,
      skip: (page - 1) * limit,
    };
  }

  async listAllBatches(params?: ListProduceQueryDto) {
    const where = this.buildProduceWhere(params);
    const pagination = this.buildPagination(params);

    return this.prisma.produce.findMany({
      where,
      include: {
        farm: this.selectFarmSummary(),
        retailer: true,
        qrCode: true,
        certifications: true,
      },
      orderBy: { createdAt: 'desc' },
      ...pagination,
    });
  }

  async listBatchesForRetailer(
    retailerId: string,
    params?: ListProduceQueryDto,
  ) {
    const where = { ...this.buildProduceWhere(params), retailerId };
    const pagination = this.buildPagination(params);
    return this.prisma.produce.findMany({
      where,
      include: {
        farm: this.selectFarmSummary(),
        retailer: true,
        qrCode: true,
        certifications: true,
      },
      orderBy: { createdAt: 'desc' },
      ...pagination,
    });
  }

  async listRetailerVerifiedWithoutReview(retailerId: string) {
    return this.prisma.produce.findMany({
      where: {
        retailerId,
        status: ProduceStatus.RETAILER_VERIFIED,
        reviews: { none: { retailerId } },
      },
      include: {
        farm: this.selectFarmSummary(),
        qrCode: true,
        certifications: true,
      },
      orderBy: { harvestDate: 'desc' },
    });
  }

  private async updateFarmRatingSummary(farmId: string) {
    const aggregate = await this.prisma.farmReview.aggregate({
      where: { farmId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregate._avg.rating ?? 0;
    const totalReviews = aggregate._count.rating;

    await this.prisma.farm.update({
      where: { id: farmId },
      data: {
        rating: averageRating,
        ratingCount: totalReviews,
      },
    });

    return { averageRating, totalReviews };
  }

  async createProduceReview(
    batchId: string,
    retailerId: string,
    rating: number,
    comment: string | undefined,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const produce = await this.prisma.produce.findUnique({
      where: { batchId },
      include: { farm: true },
    });

    if (!produce) {
      throw new NotFoundException('Produce batch not found');
    }

    if (!produce.retailerId || produce.retailerId !== retailerId) {
      throw new ForbiddenException(
        'Produce batch is not assigned to this retailer',
      );
    }

    if (produce.status !== ProduceStatus.RETAILER_VERIFIED) {
      throw new BadRequestException(
        'Only retailer-verified batches can be reviewed',
      );
    }

    const existing = await this.prisma.farmReview.findFirst({
      where: { produceId: produce.id, retailerId },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        'You have already reviewed this produce batch',
      );
    }

    const review = await this.prisma.farmReview.create({
      data: {
        farmId: produce.farmId,
        produceId: produce.id,
        retailerId,
        rating,
        comment: comment ?? null,
      },
      include: {
        produce: { select: { batchId: true, name: true } },
        retailer: true,
      },
    });

    const summary = await this.updateFarmRatingSummary(produce.farmId);

    this.logger.log(
      `Retailer ${retailerId} reviewed produce ${produce.batchId} (rating: ${rating})`,
    );

    return { review, summary };
  }

  async listFarmReviews(farmId: string, retailerId?: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
      select: { id: true },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const reviews = await this.prisma.farmReview.findMany({
      where: {
        farmId,
        ...(retailerId ? { retailerId } : {}),
      },
      include: {
        produce: { select: { batchId: true, name: true } },
        retailer: {
          select: {
            id: true,
            user: { select: { username: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = await this.updateFarmRatingSummary(farmId);

    return { reviews, summary };
  }

  async listRetailerReviewHistory(retailerId: string) {
    return this.prisma.farmReview.findMany({
      where: { retailerId },
      include: {
        produce: { select: { batchId: true, name: true, farmId: true } },
        retailer: {
          select: {
            user: { select: { username: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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
