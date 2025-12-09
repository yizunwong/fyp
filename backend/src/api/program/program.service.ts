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
import { ProgramStatus, ProgramType } from 'prisma/generated/prisma/client';

@Injectable()
export class ProgramService {
  private readonly logger = new Logger(ProgramService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async listPrograms(): Promise<ProgramResponseDto[]> {
    const programs = await this.prisma.program.findMany({
      include: {
        eligibility: true,
        payoutRule: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return programs.map((programs) => new ProgramResponseDto(programs));
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
    } catch (error) {
      this.logger.error(`enrollFarmerInProgram error: ${formatError(error)}`);
      throw new BadRequestException('Failed to enroll farmer in programs', {
        cause: error,
      });
    }
  }

  async listFarmerPrograms(farmerId: string): Promise<ProgramResponseDto[]> {
    const farmerPrograms = await this.prisma.farmerProgram.findMany({
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
    });

    return farmerPrograms.map(
      (farmerProgram) => new ProgramResponseDto(farmerProgram.programs),
    );
  }
}
