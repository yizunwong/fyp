import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  BeneficiaryCategory,
  PayoutFrequency,
  PolicyStatus,
  PolicyType,
  TriggerOperator,
  WindowUnit,
} from 'prisma/generated/prisma/enums';

export class PolicyEligibilityResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  minFarmSize?: number | null;

  @ApiPropertyOptional({ nullable: true })
  maxFarmSize?: number | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  states?: string[] | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  districts?: string[] | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  cropTypes?: string[] | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  certifications?: string[] | null;

  constructor(partial: Partial<PolicyEligibilityResponseDto>) {
    Object.assign(this, partial);
  }
}

export class EnvironmentalTriggerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  parameter!: string;

  @ApiProperty({ enum: TriggerOperator })
  operator!: TriggerOperator;

  @ApiProperty()
  threshold!: number;

  @ApiProperty()
  windowValue!: number;

  @ApiProperty({ enum: WindowUnit })
  windowUnit!: WindowUnit;

  constructor(partial: Partial<EnvironmentalTriggerResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PayoutRuleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: PayoutFrequency })
  frequency!: PayoutFrequency;

  @ApiProperty()
  maxCap!: number;

  @ApiProperty({ enum: BeneficiaryCategory })
  beneficiaryCategory!: BeneficiaryCategory;

  constructor(partial: Partial<PayoutRuleResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PolicyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;

  @ApiProperty({ enum: PolicyType })
  type!: PolicyType;

  @ApiProperty()
  @Type(() => Date)
  startDate!: Date;

  @ApiProperty()
  @Type(() => Date)
  endDate!: Date;

  @ApiProperty({ enum: PolicyStatus })
  status!: PolicyStatus;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty()
  @Type(() => Date)
  updatedAt!: Date;

  @ApiPropertyOptional({ type: PolicyEligibilityResponseDto, nullable: true })
  @Type(() => PolicyEligibilityResponseDto)
  eligibility?: PolicyEligibilityResponseDto | null;

  @ApiPropertyOptional({ type: [EnvironmentalTriggerResponseDto] })
  @Type(() => EnvironmentalTriggerResponseDto)
  triggers?: EnvironmentalTriggerResponseDto[];

  @ApiPropertyOptional({ type: PayoutRuleResponseDto, nullable: true })
  @Type(() => PayoutRuleResponseDto)
  payoutRule?: PayoutRuleResponseDto | null;

  constructor(partial: Partial<PolicyResponseDto>) {
    Object.assign(this, partial);
  }
}
