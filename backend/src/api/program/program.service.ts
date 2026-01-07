import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { formatError } from 'src/common/helpers/error';
import { CreateProgramDto } from './dto/create-program.dto';
import { ProgramResponseDto } from './dto/responses/program-response.dto';
import { ProgramStatus, ProgramType } from 'prisma/generated/prisma/enums';
import { ListProgramsQueryDto } from './dto/list-programs-query.dto';
import { Prisma } from 'prisma/generated/prisma/client';
import { ListFarmerProgramsQueryDto } from './dto/list-farmer-programs-query.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProgramService {
  private readonly logger = new Logger(ProgramService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createProgram(dto: CreateProgramDto): Promise<ProgramResponseDto> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('startDate must be before endDate');
    }

    try {
      const created = await this.prisma.program.create({
        data: {
          onchainId: dto.onchainId,
          name: dto.name,
          description: dto.description ?? undefined,
          type: dto.type.toUpperCase() as ProgramType,
          startDate: start,
          endDate: end,
          status: dto.status?.toUpperCase() as ProgramStatus | undefined,
          createdBy: dto.createdBy,
          eligibility: dto.eligibility
            ? {
                create: {
                  minFarmSize: dto.eligibility.minFarmSize ?? undefined,
                  maxFarmSize: dto.eligibility.maxFarmSize ?? undefined,
                  states: dto.eligibility.states ?? undefined,
                  districts: dto.eligibility.districts ?? undefined,
                  cropTypes: dto.eligibility.cropTypes ?? undefined,
                  landDocumentTypes:
                    dto.eligibility.landDocumentTypes ?? undefined,
                },
              }
            : undefined,
          payoutRule: dto.payoutRule
            ? {
                create: {
                  amount: dto.payoutRule.amount,
                  maxCap: dto.payoutRule.maxCap,
                },
              }
            : undefined,
        },
        include: {
          eligibility: true,
          payoutRule: true,
        },
      });

      return new ProgramResponseDto(created);
    } catch (error) {
      this.logger.error(`createProgram error: ${formatError(error)}`);
      throw new BadRequestException(
        'Failed to create programs',
        error as string,
      );
    }
  }

  private buildProgramsWhere(
    params?: ListProgramsQueryDto,
  ): Prisma.ProgramWhereInput {
    const where: Prisma.ProgramWhereInput = {};
    const andFilters: Prisma.ProgramWhereInput[] = [];

    if (params?.name) {
      where.name = { contains: params.name, mode: 'insensitive' };
    }
    if (params?.type) {
      where.type = (params.type as string).toUpperCase() as ProgramType;
    }
    if (params?.status) {
      where.status = (params.status as string).toUpperCase() as ProgramStatus;
    }
    if (params?.startDateFrom || params?.startDateTo) {
      where.startDate = {
        gte: params.startDateFrom ? new Date(params.startDateFrom) : undefined,
        lte: params.startDateTo ? new Date(params.startDateTo) : undefined,
      };
    }
    if (params?.endDateFrom || params?.endDateTo) {
      where.endDate = {
        gte: params.endDateFrom ? new Date(params.endDateFrom) : undefined,
        lte: params.endDateTo ? new Date(params.endDateTo) : undefined,
      };
    }
    if (params?.activeFrom || params?.activeTo) {
      const activeRange: Prisma.ProgramWhereInput = {};
      if (params.activeFrom) {
        activeRange.startDate = { gte: new Date(params.activeFrom) };
      }
      if (params.activeTo) {
        activeRange.endDate = { lte: new Date(params.activeTo) };
      }
      andFilters.push(activeRange);
    }
    if (
      params?.payoutAmountMin !== undefined ||
      params?.payoutAmountMax !== undefined ||
      params?.payoutCapMin !== undefined ||
      params?.payoutCapMax !== undefined
    ) {
      const payoutRuleFilters: Prisma.PayoutRuleWhereInput = {};

      if (
        params?.payoutAmountMin !== undefined ||
        params?.payoutAmountMax !== undefined
      ) {
        payoutRuleFilters.amount = {
          gte: params?.payoutAmountMin,
          lte: params?.payoutAmountMax,
        };
      }

      if (
        params?.payoutCapMin !== undefined ||
        params?.payoutCapMax !== undefined
      ) {
        payoutRuleFilters.maxCap = {
          gte: params?.payoutCapMin,
          lte: params?.payoutCapMax,
        };
      }

      if (Object.keys(payoutRuleFilters).length > 0) {
        where.payoutRule = { is: payoutRuleFilters };
      }
    }

    if (andFilters.length > 0) {
      const currentAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
          ? [where.AND]
          : [];
      where.AND = [...currentAnd, ...andFilters];
    }

    return where;
  }

  private buildPagination(params?: ListProgramsQueryDto) {
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

  async listPrograms(params?: ListProgramsQueryDto): Promise<{
    data: ProgramResponseDto[];
    total: number;
  }> {
    const where = this.buildProgramsWhere(params);
    const pagination = this.buildPagination(params);

    const [programs, total] = await Promise.all([
      this.prisma.program.findMany({
        where,
        include: {
          eligibility: true,
          payoutRule: true,
        },
        orderBy: { createdAt: 'desc' },
        ...pagination,
      }),
      this.prisma.program.count({ where }),
    ]);

    return {
      data: programs.map((program) => new ProgramResponseDto(program)),
      total,
    };
  }

  async updateProgramStatus(
    id: string,
    status: ProgramStatus,
    onchainId?: number,
  ): Promise<ProgramResponseDto> {
    const nextStatus = (status as string).toUpperCase() as ProgramStatus;

    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        eligibility: true,
        payoutRule: true,
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (
      program.status === ProgramStatus.ACTIVE &&
      nextStatus === ProgramStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Active programs cannot be moved back to draft',
      );
    }

    if (program.status === nextStatus && onchainId === undefined) {
      return new ProgramResponseDto(program);
    }

    try {
      const updateData: { status?: ProgramStatus; onchainId?: number } = {};

      if (program.status !== nextStatus) {
        updateData.status = nextStatus;
      }

      if (onchainId !== undefined) {
        updateData.onchainId = onchainId;
      }

      const updated = await this.prisma.program.update({
        where: { id },
        data: updateData,
        include: {
          eligibility: true,
          payoutRule: true,
        },
      });

      return new ProgramResponseDto(updated);
    } catch (error) {
      this.logger.error(`updateProgramStatus error: ${formatError(error)}`);
      throw new BadRequestException('Failed to update program status');
    }
  }

  async getProgramById(id: string): Promise<ProgramResponseDto> {
    const programs = await this.prisma.program.findUnique({
      where: { id },
      include: {
        eligibility: true,
        payoutRule: true,
      },
    });

    if (!programs) {
      throw new NotFoundException('Program not found');
    }

    return new ProgramResponseDto(programs);
  }

  async enrollFarmerInProgram(
    farmerId: string,
    programsId: string,
  ): Promise<void> {
    const programs = await this.prisma.program.findUnique({
      where: { id: programsId },
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

    if (!programs) {
      throw new NotFoundException('Program not found');
    }

    try {
      await this.prisma.farmerProgram.upsert({
        where: { farmerId_programsId: { farmerId, programsId } },
        update: { enrolledAt: new Date() },
        create: { farmerId, programsId, enrolledAt: new Date() },
      });

      // Get farmer info for notification
      const farmer = await this.prisma.farmer.findUnique({
        where: { id: farmerId },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      // Notify agency about enrollment
      if (programs.createdByAgency?.user?.id && farmer?.user?.username) {
        await this.notificationService.notifyAgencyProgramEnrollment(
          programs.createdByAgency.user.id,
          farmer.user.username,
          programs.name,
          programsId,
        );
      }
    } catch (error) {
      this.logger.error(`enrollFarmerInProgram error: ${formatError(error)}`);
      throw new BadRequestException('Failed to enroll farmer in programs', {
        cause: error,
      });
    }
  }

  async listFarmerPrograms(
    farmerId: string,
    params?: ListFarmerProgramsQueryDto,
  ): Promise<{ data: ProgramResponseDto[]; total: number }> {
    const pagination = this.buildPagination(params);

    const [farmerPrograms, total] = await Promise.all([
      this.prisma.farmerProgram.findMany({
        where: { farmerId },
        include: {
          programs: {
            include: {
              eligibility: true,
              payoutRule: true,
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
        ...pagination,
      }),
      this.prisma.farmerProgram.count({ where: { farmerId } }),
    ]);

    return {
      data: farmerPrograms.map(
        (farmerProgram) => new ProgramResponseDto(farmerProgram.programs),
      ),
      total,
    };
  }
}
