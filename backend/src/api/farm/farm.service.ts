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
import { LandDocumentType } from 'prisma/generated/prisma/enums';
import { Prisma } from 'prisma/generated/prisma/client';

@Injectable()
export class FarmService {
  private readonly logger = new Logger(FarmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pinataService: PinataService,
  ) {}

  async createFarm(farmerId: string, dto: CreateFarmDto) {
    await ensureFarmerExists(this.prisma, farmerId);
    try {
      return await this.prisma.farm.create({
        data: {
          name: dto.name,
          location: dto.location,
          size: dto.size,
          sizeUnit: dto.sizeUnit,
          produceCategories: dto.produceCategories,
          documents: dto.documents ?? undefined,
          farmerId,
        },
      });
    } catch (e) {
      this.logger.error(`createFarm error: ${formatError(e)}`);
      throw new BadRequestException('Failed to create farm', e as string);
    }
  }

  async listFarms(farmerId: string) {
    await ensureFarmerExists(this.prisma, farmerId);
    return this.prisma.farm.findMany({
      where: { farmerId },
      include: {
        produces: {
          include: {
            certifications: true,
          },
        },
        farmDocuments: true,
      },
      orderBy: { createdAt: 'desc' },
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
          location: dto.location ?? undefined,
          size: dto.size ?? undefined,
          sizeUnit: dto.sizeUnit ?? undefined,
          produceCategories: dto.produceCategories ?? undefined,
          documents: dto.documents ?? undefined,
        },
      });
    } catch (e) {
      this.logger.error(`updateFarm error: ${formatError(e)}`);
      throw new BadRequestException('Failed to update farm', e as string);
    }
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

  async uploadDocuments(
    farmId: string,
    files: Express.Multer.File[] | undefined,
    type: LandDocumentType | undefined,
    userId: string,
  ) {
    if (!files?.length) {
      throw new BadRequestException('At least one document file is required');
    }

    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId, farmerId: userId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found for this farmer');
    }

    const docType = type ?? LandDocumentType.OTHERS;

    const uploads = await Promise.all(
      files.map(async (file) => {
        const ipfsHash = await this.pinataService.uploadFarmDocument(file, {
          farmId,
          userId,
          documentType: docType,
        });
        return { file, ipfsHash };
      }),
    );

    const created = await this.prisma.$transaction(
      uploads.map((upload) =>
        this.prisma.farmDocument.create({
          data: {
            farmId,
            type: docType,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${upload.ipfsHash}`,
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
      `Uploaded ${created.length} farm documents for farm ${farmId} by user ${userId}`,
    );

    return created;
  }
}
