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
import { PinataService } from 'pinata/pinata.service';
import { SubsidyEvidenceResponseDto } from './dto/responses/subsidy-evidence-response.dto';
import { SubsidyEvidenceType } from 'prisma/generated/prisma/client';

@Injectable()
export class SubsidyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly pinataService: PinataService,
  ) {}

  async requestSubsidy(
    farmerId: string,
    dto: RequestSubsidyDto,
  ): Promise<SubsidyResponseDto> {
    await ensureFarmerExists(this.prisma, farmerId);

    if (dto.programsId) {
      const programs = await this.prisma.program.findUnique({
        where: { id: dto.programsId },
      });
      if (!programs) {
        throw new BadRequestException('Invalid programsId');
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
          programsId: dto.programsId ?? undefined,
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
      include: {
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
      orderBy: { createdAt: 'desc' },
    });
    return subsidies.map(
      (s) =>
        new SubsidyResponseDto({
          ...s,
          farmer: s.farmer.user,
        }),
    );
  }

  async listAllSubsidies(): Promise<SubsidyResponseDto[]> {
    const subsidies = await this.prisma.subsidy.findMany({
      include: {
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
      orderBy: { createdAt: 'desc' },
    });
    return subsidies.map(
      (s) =>
        new SubsidyResponseDto({
          ...s,
          farmer: s.farmer.user,
        }),
    );
  }

  async getSubsidyById(
    farmerId: string,
    subsidyId: string,
  ): Promise<SubsidyResponseDto> {
    await ensureFarmerExists(this.prisma, farmerId);
    const subsidy = await this.prisma.subsidy.findFirst({
      where: { id: subsidyId, farmerId },
      include: {
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
        evidences: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });
    if (!subsidy) {
      throw new NotFoundException('Subsidy request not found');
    }
    return new SubsidyResponseDto({
      ...subsidy,
      farmer: subsidy.farmer.user,
    });
  }

  async getSubsidyByIdForAgency(
    subsidyId: string,
  ): Promise<SubsidyResponseDto> {
    const subsidy = await this.prisma.subsidy.findUnique({
      where: { id: subsidyId },
      include: {
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
        evidences: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });
    if (!subsidy) {
      throw new NotFoundException('Subsidy request not found');
    }
    return new SubsidyResponseDto({
      ...subsidy,
      farmer: subsidy.farmer.user,
    });
  }

  async approveSubsidy(subsidyId: string): Promise<SubsidyResponseDto> {
    const subsidy = await this.prisma.subsidy.findUnique({
      where: { id: subsidyId },
      include: {
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

    if (!subsidy) {
      throw new NotFoundException('Subsidy request not found');
    }

    if (subsidy.status !== SubsidyStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve subsidy with status ${subsidy.status}. Only PENDING subsidies can be approved.`,
      );
    }

    const updated = await this.prisma.subsidy.update({
      where: { id: subsidyId },
      data: {
        status: SubsidyStatus.APPROVED,
        approvedAt: new Date(),
      },
      include: {
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

    return new SubsidyResponseDto({
      ...updated,
      farmer: updated.farmer.user,
    });
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

    const evidenceType = this.resolveEvidenceType(file.mimetype);
    let storageUrl: string;
    let fileName: string | undefined = file.originalname;

    // Upload PDFs to IPFS Pinata, images to Cloudinary
    if (evidenceType === SubsidyEvidenceType.PDF) {
      const ipfsHash = await this.pinataService.uploadSubsidyEvidence(file, {
        subsidyId,
        farmerId,
        evidenceType: 'PDF',
      });
      storageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } else {
      // Upload images to Cloudinary
      const upload = await this.cloudinaryService.uploadFile(
        file.buffer,
        'subsidy-evidence',
      );
      storageUrl = upload.url;
      fileName = file.originalname ?? upload.originalFilename;
    }

    const created = await this.prisma.subsidyEvidence.create({
      data: {
        subsidyId,
        type: evidenceType,
        storageUrl,
        fileName,
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
