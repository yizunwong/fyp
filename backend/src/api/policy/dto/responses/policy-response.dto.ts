import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  LandDocumentType,
  PolicyStatus,
  PolicyType,
} from 'prisma/generated/prisma/enums';

export class PolicyEligibilityResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true, type: Number })
  minFarmSize?: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  maxFarmSize?: number | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  states?: string[] | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  districts?: string[] | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  cropTypes?: string[] | null;

  @ApiPropertyOptional({
    enum: LandDocumentType,
    isArray: true,
    nullable: true,
  })
  landDocumentTypes?: LandDocumentType[] | null;

  constructor(partial: Partial<PolicyEligibilityResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PayoutRuleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  maxCap!: number;

  constructor(partial: Partial<PayoutRuleResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PolicyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
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

  @ApiPropertyOptional({ type: PayoutRuleResponseDto, nullable: true })
  @Type(() => PayoutRuleResponseDto)
  payoutRule?: PayoutRuleResponseDto | null;

  constructor(partial: Partial<PolicyResponseDto>) {
    Object.assign(this, partial);
  }
}
