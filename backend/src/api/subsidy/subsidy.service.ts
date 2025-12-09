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

@Injectable()
export class SubsidyService {
  constructor(private readonly prisma: PrismaService) {}

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

  async markOnChainClaim(
    subsidyId: string,
    onChainClaimId: string,
    onChainTxHash?: string,
    status?: SubsidyStatus,
  ): Promise<SubsidyResponseDto> {
    const subsidy = await this.prisma.subsidy.findUnique({
      where: { id: subsidyId },
    });
    if (!subsidy) {
      throw new NotFoundException('Subsidy request not found');
    }

    const updated = await this.prisma.subsidy.update({
      where: { id: subsidyId },
      data: {
        onChainClaimId: BigInt(onChainClaimId),
        onChainTxHash: onChainTxHash ?? undefined,
        status: status ?? subsidy.status,
      },
    });

    return new SubsidyResponseDto(updated);
  }
}
