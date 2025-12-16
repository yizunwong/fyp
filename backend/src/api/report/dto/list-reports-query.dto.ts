import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ReportType, ReportStatus } from 'prisma/generated/prisma/enums';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListReportsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by report type',
    enum: ReportType,
  })
  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @ApiPropertyOptional({
    description: 'Filter by report status',
    enum: ReportStatus,
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({
    description: 'Filter reports created on or after this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter reports created on or before this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

