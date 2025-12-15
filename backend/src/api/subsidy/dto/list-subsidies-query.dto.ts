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
import { SubsidyStatus } from 'prisma/generated/prisma/enums';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListSubsidiesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by program name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  programName?: string;

  @ApiPropertyOptional({
    description: 'Filter subsidies applied on or after this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  appliedDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter subsidies applied on or before this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  appliedDateTo?: string;

  @ApiPropertyOptional({
    description: 'Minimum subsidy amount',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum subsidy amount',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountMax?: number;

  @ApiPropertyOptional({
    description: 'Filter by subsidy status',
    enum: SubsidyStatus,
  })
  @IsOptional()
  @IsEnum(SubsidyStatus)
  status?: SubsidyStatus;
}
