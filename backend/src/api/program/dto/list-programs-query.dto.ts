import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProgramStatus, ProgramType } from 'prisma/generated/prisma/enums';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListProgramsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by program name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by program type',
    enum: ProgramType,
  })
  @IsOptional()
  @IsEnum(ProgramType)
  type?: ProgramType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ProgramStatus })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;

  @ApiPropertyOptional({ description: 'Start date on or after (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({ description: 'Start date on or before (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({ description: 'End date on or after (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDateFrom?: string;

  @ApiPropertyOptional({ description: 'End date on or before (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDateTo?: string;

  @ApiPropertyOptional({
    description:
      'Active period start (program start date on or after this ISO date)',
  })
  @IsOptional()
  @IsDateString()
  activeFrom?: string;

  @ApiPropertyOptional({
    description:
      'Active period end (program end date on or before this ISO date)',
  })
  @IsOptional()
  @IsDateString()
  activeTo?: string;

  @ApiPropertyOptional({ description: 'Minimum payout amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  payoutAmountMin?: number;

  @ApiPropertyOptional({ description: 'Maximum payout amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  payoutAmountMax?: number;

  @ApiPropertyOptional({ description: 'Minimum payout max cap' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  payoutCapMin?: number;

  @ApiPropertyOptional({ description: 'Maximum payout max cap' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  payoutCapMax?: number;
}
