import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { formatError } from 'src/common/helpers/error';
import { CreatePolicyDto } from './dto/create-policy.dto';
import {
  PolicyEligibilityResponseDto,
  PolicyResponseDto,
  PayoutRuleResponseDto,
} from './dto/responses/policy-response.dto';
import { Prisma } from 'prisma/generated/prisma/client';

type PolicyWithRelations = Prisma.PolicyGetPayload<{
  include: {
    eligibility: true;
    payoutRule: true;
  };
}>;

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
          name: dto.name,
          description: dto.description ?? undefined,
          type: dto.type,
          startDate: start,
          endDate: end,
          status: dto.status ?? undefined,
          createdBy: dto.createdBy,
          eligibility: dto.eligibility
            ? {
                create: {
                  minFarmSize: dto.eligibility.minFarmSize ?? undefined,
                  maxFarmSize: dto.eligibility.maxFarmSize ?? undefined,
                  states: dto.eligibility.states ?? undefined,
                  districts: dto.eligibility.districts ?? undefined,
                  cropTypes: dto.eligibility.cropTypes ?? undefined,
                  certifications: dto.eligibility.certifications ?? undefined,
                },
              }
            : undefined,
          payoutRule: dto.payoutRule
            ? {
                create: {
                  amount: dto.payoutRule.amount,
                  frequency: dto.payoutRule.frequency,
                  maxCap: dto.payoutRule.maxCap,
                  beneficiaryCategory: dto.payoutRule.beneficiaryCategory,
                },
              }
            : undefined,
        },
        include: {
          eligibility: true,
          payoutRule: true,
        },
      });

      return this.mapPolicy(created);
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

    return policies.map((policy) => this.mapPolicy(policy));
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

    return this.mapPolicy(policy);
  }

  private mapPolicy(policy: PolicyWithRelations): PolicyResponseDto {
    return new PolicyResponseDto({
      ...policy,
      eligibility: policy.eligibility
        ? new PolicyEligibilityResponseDto(policy.eligibility)
        : null,
      payoutRule: policy.payoutRule
        ? new PayoutRuleResponseDto(policy.payoutRule)
        : null,
    });
  }
}
