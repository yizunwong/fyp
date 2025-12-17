import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  LandDocumentType,
  ProgramStatus,
  ProgramType,
} from 'prisma/generated/prisma/enums';
import { Type } from 'class-transformer';

export class CreateProgramEligibilityDto {
  @ApiPropertyOptional({ description: 'Minimum farm size to qualify' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minFarmSize?: number;

  @ApiPropertyOptional({ description: 'Maximum farm size to qualify' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxFarmSize?: number;

  @ApiPropertyOptional({ type: [String], description: 'Allowed states' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  states?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Allowed districts' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  districts?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Allowed crop types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cropTypes?: string[];

  @ApiProperty({
    description: 'Document type for each uploaded document.',
    type: 'string',
    enum: LandDocumentType,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(LandDocumentType, { each: true })
  landDocumentTypes!: LandDocumentType[];
}

export class CreatePayoutRuleDto {
  @ApiProperty({ description: 'Payout amount' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Maximum payout cap' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  maxCap!: number;
}

export class CreateProgramDto {
  @ApiProperty({ description: 'On-chain identifier for the programs' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  onchainId!: number;

  @ApiProperty({ description: 'Program name' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Program description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ProgramType,
    description: 'Program category/type',
    example: ProgramType.FLOOD,
  })
  @IsNotEmpty()
  @IsEnum(ProgramType)
  type!: ProgramType;

  @ApiProperty({
    description: 'Program start date (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Program end date (ISO 8601)',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({
    enum: ProgramStatus,
    description: 'Program lifecycle status',
    example: ProgramStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;

  @ApiProperty({ description: 'Creator identifier (user id or email)' })
  @IsNotEmpty()
  @IsString()
  createdBy!: string;

  @ApiPropertyOptional({
    type: CreateProgramEligibilityDto,
    description: 'Eligibility rules for this programs',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProgramEligibilityDto)
  eligibility?: CreateProgramEligibilityDto;

  @ApiPropertyOptional({
    type: CreatePayoutRuleDto,
    description: 'Payout rule configuration',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePayoutRuleDto)
  payoutRule?: CreatePayoutRuleDto;
}
