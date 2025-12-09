import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  LandDocumentType,
  ProgramStatus,
  ProgramType,
} from 'prisma/generated/prisma/enums';

export class ProgramEligibilityResponseDto {
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

  constructor(partial: Partial<ProgramEligibilityResponseDto>) {
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

export class ProgramResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  onchainId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  description?: string | null;

  @ApiProperty({ enum: ProgramType })
  type!: ProgramType;

  @ApiProperty()
  @Type(() => Date)
  startDate!: Date;

  @ApiProperty()
  @Type(() => Date)
  endDate!: Date;

  @ApiProperty({ enum: ProgramStatus })
  status!: ProgramStatus;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty()
  @Type(() => Date)
  updatedAt!: Date;

  @ApiPropertyOptional({ type: ProgramEligibilityResponseDto, nullable: true })
  @Type(() => ProgramEligibilityResponseDto)
  eligibility?: ProgramEligibilityResponseDto | null;

  @ApiPropertyOptional({ type: PayoutRuleResponseDto, nullable: true })
  @Type(() => PayoutRuleResponseDto)
  payoutRule?: PayoutRuleResponseDto | null;

  constructor(partial: Partial<ProgramResponseDto>) {
    Object.assign(this, partial);
  }
}
