import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestSubsidyDto } from './dto/request-subsidy.dto';
import { ensureFarmerExists } from 'src/common/helpers/farmer';
import { SubsidyResponseDto } from './dto/responses/subsidy-response.dto';
import { formatError } from 'src/common/helpers/error';
import { SubsidyStatus } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SubsidyEvidenceResponseDto } from './dto/responses/subsidy-evidence-response.dto';
import { SubsidyEvidenceType } from 'prisma/generated/prisma/client';

@Injectable()
export class SubsidyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async requestSubsidy(
    farmerId: string,
    dto: RequestSubsidyDto,
  ): Promise<SubsidyResponseDto> {
    await ensureFarmerExists(this.prisma, farmerId);

    if (dto.policyId) {
      const policy = await this.prisma.policy.findUnique({
        where: { id: dto.policyId },
      });
      if (!policy) {
        throw new BadRequestException('Invalid policyId');
      }
    }

    try {
      const created = await this.prisma.subsidy.create({
        data: {
          onChainClaimId: dto.onChainClaimId,
          onChainTxHash: dto.onChainTxHash,
          farmerId,
          status: SubsidyStatus.PENDING,
          amount: dto.amount,
          weatherEventId: dto.weatherEventId ?? undefined,
          policyId: dto.policyId ?? undefined,
          metadataHash: dto.metadataHash,
        },
      });

      return new SubsidyResponseDto(created);
    } catch (e) {
      throw new BadRequestException(
        'Failed to create subsidy request',
        formatError(e),
      );
    }
  }

  async listSubsidies(farmerId: string): Promise<SubsidyResponseDto[]> {
    await ensureFarmerExists(this.prisma, farmerId);
    const subsidies = await this.prisma.subsidy.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });
    return subsidies.map((s) => new SubsidyResponseDto(s));
  }

  async getSubsidyById(
    farmerId: string,
    subsidyId: string,
  ): Promise<SubsidyResponseDto> {
    await ensureFarmerExists(this.prisma, farmerId);
    const subsidy = await this.prisma.subsidy.findFirst({
      where: { id: subsidyId, farmerId },
    });
    if (!subsidy) {
      throw new NotFoundException('Subsidy request not found');
    }
    return new SubsidyResponseDto(subsidy);
  }

  private resolveEvidenceType(
    mimeType: string | undefined,
  ): SubsidyEvidenceType {
    if (!mimeType) return SubsidyEvidenceType.PHOTO;
    const lower = mimeType.toLowerCase();
    if (lower.startsWith('image/')) return SubsidyEvidenceType.PHOTO;
    if (lower === 'application/pdf') return SubsidyEvidenceType.PDF;
    return SubsidyEvidenceType.PHOTO;
  }

  async uploadEvidence(
    subsidyId: string,
    file: Express.Multer.File | undefined,
    farmerId: string,
  ): Promise<SubsidyEvidenceResponseDto> {
    if (!file) {
      throw new BadRequestException('Evidence file is required');
    }

    const mime = (file.mimetype || '').toLowerCase();
    if (!mime.startsWith('image/') && mime !== 'application/pdf') {
      throw new BadRequestException('Only image or PDF evidence is allowed');
    }

    const subsidy = await this.prisma.subsidy.findFirst({
      where: { id: subsidyId, farmerId },
    });

    if (!subsidy) {
      throw new NotFoundException('Subsidy request not found for this farmer');
    }

    const upload = await this.cloudinaryService.uploadFile(
      file.buffer,
      'subsidy-evidence',
    );

    const created = await this.prisma.subsidyEvidence.create({
      data: {
        subsidyId,
        type: this.resolveEvidenceType(file.mimetype),
        storageUrl: upload.url,
        fileName: file.originalname ?? upload.originalFilename,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
    });

    return new SubsidyEvidenceResponseDto({
      ...created,
      uploadedAt: created.uploadedAt,
    });
  }
}
