import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  FarmVerificationStatus,
  ProgramType,
} from 'prisma/generated/prisma/enums';

/**
 * Query parameters used to filter data when generating a report.
 * These values are stored on the report record as JSON `parameters`.
 */
export class CreateReportQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by farm ID (used for farm/produce related reports)',
  })
  @IsOptional()
  @IsString()
  farmId?: string;

  @ApiPropertyOptional({
    description: 'Filter farms by state',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Filter farms by district',
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({
    description: 'Filter data on or after this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter data on or before this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description:
      'Generic status filter (interpreted per report type, e.g. subsidy/produce/program status)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Action filter (used for activity reports)',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description:
      'ETH to MYR exchange rate at the time of report generation (used for subsidy reports)',
  })
  @IsOptional()
  @IsNumberString()
  ethToMyr?: string;

  @ApiPropertyOptional({
    description: 'Minimum farm size (inclusive, numeric string)',
  })
  @IsOptional()
  @IsNumberString()
  minFarmSize?: string;

  @ApiPropertyOptional({
    description: 'Maximum farm size (inclusive, numeric string)',
  })
  @IsOptional()
  @IsNumberString()
  maxFarmSize?: string;

  @ApiPropertyOptional({
    description: 'Filter farms by verification status',
    enum: FarmVerificationStatus,
  })
  @IsOptional()
  @IsEnum(FarmVerificationStatus)
  farmVerificationStatus?: FarmVerificationStatus;

  @ApiPropertyOptional({
    description: 'Filter programs by type',
    enum: ProgramType,
  })
  @IsOptional()
  @IsEnum(ProgramType)
  programType?: ProgramType;
}
