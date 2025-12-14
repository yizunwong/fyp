import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { ensureFarmerExists } from 'src/common/helpers/farmer';
import { formatError } from 'src/common/helpers/error';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { PinataService } from 'pinata/pinata.service';
import {
  LandDocumentType,
  FarmVerificationStatus,
} from 'prisma/generated/prisma/enums';
import { Prisma } from 'prisma/generated/prisma/client';
import { CreateFarmResponseDto } from './dto/responses/create-farm.dto';
import { PendingFarmResponseDto } from './dto/responses/pending-farm.dto';
import { ListFarmQueryDto } from './dto/list-farm-query.dto';

type FarmDocumentSyncInput = {
  id?: string;
  type: LandDocumentType;
  ipfsUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  metadata?: Prisma.InputJsonValue | null;
};

@Injectable()
export class FarmService {
  private readonly logger = new Logger(FarmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pinataService: PinataService,
  ) {}

  private buildFarmWhere(
    farmerId: string,
    params?: ListFarmQueryDto,
  ): Prisma.FarmWhereInput {
    const filters: Prisma.FarmWhereInput[] = [{ farmerId }];

    console.log(params);

    const name = params?.name?.trim();
    if (name) {
      filters.push({
        name: { contains: name, mode: 'insensitive' },
      });
    }

    const location = params?.location?.trim();
    if (location) {
      filters.push({
        OR: [
          { address: { contains: location, mode: 'insensitive' } },
          { district: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } },
        ],
      });
    }

    if (params?.status) {
      filters.push({ verificationStatus: params.status });
    }

    const category = params?.category?.trim();
    if (category) {
      filters.push({ produceCategories: { has: category } });
    }

    const sizeFilter: { gte?: number; lte?: number } = {};
    const parsedMinSize =
      params?.minSize !== undefined ? Number(params.minSize) : undefined;
    const parsedMaxSize =
      params?.maxSize !== undefined ? Number(params.maxSize) : undefined;

    if (parsedMinSize !== undefined && Number.isFinite(parsedMinSize)) {
      sizeFilter.gte = parsedMinSize;
    }
    if (parsedMaxSize !== undefined && Number.isFinite(parsedMaxSize)) {
      sizeFilter.lte = parsedMaxSize;
    }
    if (sizeFilter.gte !== undefined || sizeFilter.lte !== undefined) {
      filters.push({ size: sizeFilter });
    }

    if (params?.sizeUnit) {
      filters.push({ sizeUnit: params.sizeUnit });
    }

    return { AND: filters };
  }

  private buildPagination(params?: ListFarmQueryDto) {
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

  async createFarm(farmerId: string, dto: CreateFarmDto) {
    await ensureFarmerExists(this.prisma, farmerId);
    try {
      const created = await this.prisma.farm.create({
        data: {
          name: dto.name,
          address: dto.address,
          state: dto.state,
          district: dto.district,
          size: dto.size,
          sizeUnit: dto.sizeUnit,
          produceCategories: dto.produceCategories,
          farmerId,
        },
      });

      return new CreateFarmResponseDto({
        ...created,
      });
    } catch (e) {
      this.logger.error(`createFarm error: ${formatError(e)}`);
      throw new BadRequestException('Failed to create farm', e as string);
    }
  }

  async listFarms(farmerId: string, params?: ListFarmQueryDto) {
    await ensureFarmerExists(this.prisma, farmerId);
    const where = this.buildFarmWhere(farmerId, params);
    const pagination = this.buildPagination(params);

    return this.prisma.farm.findMany({
      where,
      include: {
        produces: {
          include: {
            certifications: true,
          },
        },
        farmDocuments: true,
      },
      orderBy: { createdAt: 'desc' },
      ...pagination,
    });
  }

  async getFarm(farmerId: string, farmId: string) {
    await ensureFarmerExists(this.prisma, farmerId);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
      include: {
        produces: {
          include: {
            qrCode: true,
            certifications: true,
          },
        },
        farmDocuments: true,
      },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    return farm;
  }

  async updateFarm(farmerId: string, farmId: string, dto: UpdateFarmDto) {
    await ensureFarmerExists(this.prisma, farmerId);

    const existing = await this.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });

    if (!existing) {
      throw new NotFoundException('Farm not found');
    }

    try {
      return await this.prisma.farm.update({
        where: { id: farmId },
        data: {
          name: dto.name ?? undefined,
          address: dto.address ?? undefined,
          state: dto.state ?? undefined,
          district: dto.district ?? undefined,
          size: dto.size ?? undefined,
          sizeUnit: dto.sizeUnit ?? undefined,
          produceCategories: dto.produceCategories ?? undefined,
        },
      });
    } catch (e) {
      this.logger.error(`updateFarm error: ${formatError(e)}`);
      throw new BadRequestException('Failed to update farm', e as string);
    }
  }

  async setVerificationStatus(farmId: string, status: FarmVerificationStatus) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    return this.prisma.farm.update({
      where: { id: farmId },
      data: { verificationStatus: status },
    });
  }

  async listPendingFarms(): Promise<PendingFarmResponseDto[]> {
    const farms = await this.prisma.farm.findMany({
      where: { verificationStatus: FarmVerificationStatus.PENDING },
      include: {
        farmDocuments: true,
        farmer: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                nric: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return farms.map(
      (farm) =>
        new PendingFarmResponseDto({
          ...farm,
          farmer: farm.farmer.user,
        }),
    );
  }

  async getPendingFarm(farmId: string): Promise<PendingFarmResponseDto> {
    const farm = await this.prisma.farm.findFirst({
      where: {
        id: farmId,
        verificationStatus: FarmVerificationStatus.PENDING,
      },
      include: {
        farmDocuments: true,
        farmer: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                nric: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!farm) {
      throw new NotFoundException('Pending farm not found');
    }

    return new PendingFarmResponseDto({
      ...farm,
      farmer: farm.farmer.user,
    });
  }

  async deleteFarm(farmerId: string, farmId: string) {
    await ensureFarmerExists(this.prisma, farmerId);

    const existing = await this.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });

    if (!existing) {
      throw new NotFoundException('Farm not found');
    }

    try {
      await this.prisma.farm.delete({ where: { id: farmId } });
      return { success: true };
    } catch (e) {
      this.logger.error(`deleteFarm error: ${formatError(e)}`);
      throw new BadRequestException('Failed to delete farm', e as string);
    }
  }

  /**
   * Reconcile farm documents for a farm by comparing what exists in the DB with
   * the target list provided by the caller. Removed documents are deleted,
   * newly added documents are inserted, and changed documents are updated.
   */
  async syncFarmDocuments(
    farmerId: string,
    farmId: string,
    nextDocuments: FarmDocumentSyncInput[] = [],
  ) {
    await ensureFarmerExists(this.prisma, farmerId);

    const farm = await this.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const existingDocs = await this.prisma.farmDocument.findMany({
      where: { farmId },
    });

    const nextDocsById = new Map(
      nextDocuments
        .filter((doc) => doc.id)
        .map((doc) => [doc.id as string, doc]),
    );

    const deletions = existingDocs
      .filter((doc) => !nextDocsById.has(doc.id))
      .map((doc) => this.prisma.farmDocument.delete({ where: { id: doc.id } }));

    const updates: Prisma.PrismaPromise<unknown>[] = [];
    for (const doc of existingDocs) {
      const next = nextDocsById.get(doc.id);
      if (!next) continue;

      const metadataChanged =
        JSON.stringify(next.metadata ?? null) !==
        JSON.stringify(doc.metadata ?? null);
      const hasChange =
        next.type !== doc.type ||
        next.ipfsUrl !== doc.ipfsUrl ||
        (next.fileName ?? null) !== (doc.fileName ?? null) ||
        (next.mimeType ?? null) !== (doc.mimeType ?? null) ||
        (next.fileSize ?? null) !== (doc.fileSize ?? null) ||
        metadataChanged;

      if (hasChange) {
        updates.push(
          this.prisma.farmDocument.update({
            where: { id: doc.id },
            data: {
              type: next.type,
              ipfsUrl: next.ipfsUrl,
              fileName: next.fileName ?? null,
              mimeType: next.mimeType ?? null,
              fileSize: next.fileSize ?? null,
              metadata: next.metadata ?? undefined,
            },
          }),
        );
      }
    }

    const creations = nextDocuments
      .filter((doc) => !doc.id)
      .map((doc) =>
        this.prisma.farmDocument.create({
          data: {
            farmId,
            type: doc.type,
            ipfsUrl: doc.ipfsUrl,
            fileName: doc.fileName ?? null,
            mimeType: doc.mimeType ?? null,
            fileSize: doc.fileSize ?? null,
            metadata: doc.metadata ?? undefined,
          },
        }),
      );

    if (deletions.length || updates.length || creations.length) {
      await this.prisma.$transaction([...deletions, ...updates, ...creations]);
    }

    return {
      deleted: deletions.length,
      updated: updates.length,
      created: creations.length,
    };
  }

  async uploadDocuments(
    farmId: string,
    files: Express.Multer.File[] | undefined,
    types: LandDocumentType[] | undefined, // <-- changed
    userId: string,
  ) {
    const typeList: LandDocumentType[] = Array.isArray(types)
      ? types
      : types
        ? [types]
        : [];

    if (!files?.length) {
      throw new BadRequestException('At least one document file is required');
    }

    if (
      files?.length &&
      (!typeList.length || typeList.length !== files.length)
    ) {
      throw new BadRequestException(
        'Each uploaded document must have a corresponding type',
      );
    }

    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId, farmerId: userId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found for this farmer');
    }

    // Pair each new file with its matching type and upload
    const uploads = await Promise.all(
      files.map(async (file, index) => {
        const docType = typeList?.[index] ?? LandDocumentType.OTHERS;

        const ipfsHash = await this.pinataService.uploadFarmDocument(file, {
          farmId,
          userId,
          documentType: docType,
        });

        return {
          file,
          ipfsHash,
          type: docType,
        };
      }),
    );

    const nextDocuments: FarmDocumentSyncInput[] = uploads.map((upload) => ({
      type: upload.type,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${upload.ipfsHash}`,
      fileName: upload.file.originalname,
      mimeType: upload.file.mimetype,
      fileSize: upload.file.size,
      metadata: {
        fieldName: upload.file.fieldname,
        ipfsHash: upload.ipfsHash,
      } as Prisma.InputJsonValue,
    }));

    const result = await this.syncFarmDocuments(userId, farmId, nextDocuments);

    this.logger.log(
      `Synced farm documents for farm ${farmId} by user ${userId} (created: ${result.created}, updated: ${result.updated}, deleted: ${result.deleted})`,
    );

    return result;
  }
}
