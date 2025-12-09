import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { formatError } from 'src/common/helpers/error';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyResponseDto } from './dto/responses/policy-response.dto';
import { PolicyStatus, PolicyType } from 'prisma/generated/prisma/client';

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPolicy(dto: CreatePolicyDto): Promise<PolicyResponseDto> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('startDate must be before endDate');
    }

    try {
      const created = await this.prisma.policy.create({
        data: {
          onchainId: dto.onchainId,
          name: dto.name,
          description: dto.description ?? undefined,
          type: dto.type.toUpperCase() as PolicyType,
          startDate: start,
          endDate: end,
          status: dto.status?.toUpperCase() as PolicyStatus | undefined,
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

      return new PolicyResponseDto(created);
    } catch (error) {
      this.logger.error(`createPolicy error: ${formatError(error)}`);
      throw new BadRequestException('Failed to create policy', error as string);
    }
  }

  async listPolicies(): Promise<PolicyResponseDto[]> {
    const policies = await this.prisma.policy.findMany({
      include: {
        eligibility: true,
        payoutRule: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return policies.map((policy) => new PolicyResponseDto(policy));
  }

  async getPolicyById(id: string): Promise<PolicyResponseDto> {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: {
        eligibility: true,
        payoutRule: true,
      },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    return new PolicyResponseDto(policy);
  }
}
