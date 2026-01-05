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
import { SubsidyStatus } from 'prisma/generated/prisma/enums';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PinataService } from 'pinata/pinata.service';
import { SubsidyEvidenceResponseDto } from './dto/responses/subsidy-evidence-response.dto';
import { SubsidyEvidenceType } from 'prisma/generated/prisma/client';
import { ListSubsidiesQueryDto } from './dto/list-subsidies-query.dto';
import { Prisma } from 'prisma/generated/prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SubsidyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly pinataService: PinataService,
    private readonly notificationService: NotificationService,
  ) {}

  async requestSubsidy(
    farmerId: string,
    dto: RequestSubsidyDto,
  ): Promise<SubsidyResponseDto> {
    await ensureFarmerExists(this.prisma, farmerId);

    let programs: {
      id: string;
      name: string;
      createdByAgency: {
        user: {
          id: string;
        };
      };
    } | null = null;

    if (dto.programsId) {
      const programData = await this.prisma.program.findUnique({
        where: { id: dto.programsId },
        include: {
          createdByAgency: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      if (!programData) {
        throw new BadRequestException('Invalid programsId');
      }
      programs = programData;
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
          programs: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Notify agency when subsidy is submitted
      if (
        programs?.createdByAgency?.user?.id &&
        created.farmer?.user?.username
      ) {
        void this.notificationService.notifyAgencySubsidySubmitted(
          programs.createdByAgency.user.id,
          created.farmer.user.username,
          programs.name,
          created.id,
          created.amount,
        );
      }

      return new SubsidyResponseDto({
        ...created,
        farmer: created.farmer.user,
        programName: created.programs?.name || null,
      });
    } catch (e) {
      throw new BadRequestException(
        'Failed to create subsidy request',
        formatError(e),
      );
    }
  }

  private buildSubsidiesWhere(
    farmerId: string,
    params?: ListSubsidiesQueryDto,
  ): Prisma.SubsidyWhereInput {
    const where: Prisma.SubsidyWhereInput = { farmerId };

    if (params?.programName) {
      where.programs = {
        name: { contains: params.programName, mode: 'insensitive' },
      };
    }

    if (params?.appliedDateFrom || params?.appliedDateTo) {
      where.createdAt = {
        gte: params.appliedDateFrom
          ? new Date(params.appliedDateFrom)
          : undefined,
        lte: params.appliedDateTo ? new Date(params.appliedDateTo) : undefined,
      };
    }

    if (params?.amountMin !== undefined || params?.amountMax !== undefined) {
      where.amount = {
        gte: params.amountMin,
        lte: params.amountMax,
      };
    }

    if (params?.status) {
      where.status = params.status;
    }

    return where;
  }

  private buildPagination(params?: ListSubsidiesQueryDto) {
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

  async listSubsidies(
    farmerId: string,
    params?: ListSubsidiesQueryDto,
  ): Promise<{ data: SubsidyResponseDto[]; total: number }> {
    await ensureFarmerExists(this.prisma, farmerId);
    const where = this.buildSubsidiesWhere(farmerId, params);
    const pagination = this.buildPagination(params);

    const [subsidies, total] = await Promise.all([
      this.prisma.subsidy.findMany({
        where,
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
          programs: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...pagination,
      }),
      this.prisma.subsidy.count({ where }),
    ]);

    return {
      data: subsidies.map(
        (s) =>
          new SubsidyResponseDto({
            ...s,
            farmer: s.farmer.user,
            programName: s.programs?.name || null,
          }),
      ),
      total,
    };
  }

  async listAllSubsidies(
    agencyId: string,
    params?: ListSubsidiesQueryDto,
  ): Promise<{
    data: SubsidyResponseDto[];
    total: number;
  }> {
    const where = this.buildSubsidiesWhereForAgency(agencyId, params);
    const pagination = this.buildPagination(params);

    const [subsidies, total] = await Promise.all([
      this.prisma.subsidy.findMany({
        where,
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
          programs: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...pagination,
      }),
      this.prisma.subsidy.count({ where }),
    ]);

    return {
      data: subsidies.map(
        (s) =>
          new SubsidyResponseDto({
            ...s,
            farmer: s.farmer.user,
            programName: s.programs?.name || null,
          }),
      ),
      total,
    };
  }

  private buildSubsidiesWhereForAgency(
    agencyId: string,
    params?: ListSubsidiesQueryDto,
  ): Prisma.SubsidyWhereInput {
    const programsWhere: Prisma.ProgramWhereInput = {
      createdBy: agencyId,
    };

    if (params?.programName) {
      programsWhere.name = {
        contains: params.programName,
        mode: 'insensitive',
      };
    }

    const where: Prisma.SubsidyWhereInput = {
      programs: programsWhere,
    };

    if (params?.appliedDateFrom || params?.appliedDateTo) {
      where.createdAt = {
        gte: params.appliedDateFrom
          ? new Date(params.appliedDateFrom)
          : undefined,
        lte: params.appliedDateTo ? new Date(params.appliedDateTo) : undefined,
      };
    }

    if (params?.amountMin !== undefined || params?.amountMax !== undefined) {
      where.amount = {
        gte: params.amountMin,
        lte: params.amountMax,
      };
    }

    if (params?.status) {
      where.status = params.status;
    }

    return where;
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
        programs: {
          select: {
            id: true,
            name: true,
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
      programName: subsidy.programs?.name || null,
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
        programs: {
          select: {
            id: true,
            name: true,
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
      programName: subsidy.programs?.name || null,
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
        programs: {
          select: {
            id: true,
            name: true,
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
        programs: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notify farmer when subsidy is approved
    if (updated.farmer?.user?.id) {
      void this.notificationService.notifyFarmerSubsidyApproved(
        updated.farmer.user.id,
        updated.programs?.name || 'Unknown Program',
        updated.id,
        updated.amount,
      );
    }

    return new SubsidyResponseDto({
      ...updated,
      farmer: updated.farmer.user,
      programName: updated.programs?.name || null,
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

  async disburseSubsidy(subsidyId: string): Promise<SubsidyResponseDto> {
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
        programs: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subsidy) {
      throw new NotFoundException('Subsidy request not found');
    }

    if (subsidy.status !== SubsidyStatus.APPROVED) {
      throw new BadRequestException(
        `Cannot disburse subsidy with status ${subsidy.status}. Only APPROVED subsidies can be disbursed.`,
      );
    }

    const updated = await this.prisma.subsidy.update({
      where: { id: subsidyId },
      data: {
        status: SubsidyStatus.DISBURSED,
        paidAt: new Date(),
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
        programs: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notify farmer when subsidy is disbursed
    if (updated.farmer?.user?.id) {
      void this.notificationService.notifyFarmerSubsidyDisbursed(
        updated.farmer.user.id,
        updated.programs?.name || 'Unknown Program',
        updated.id,
        updated.amount,
      );
    }

    return new SubsidyResponseDto({
      ...updated,
      farmer: updated.farmer.user,
      programName: updated.programs?.name || null,
    });
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
