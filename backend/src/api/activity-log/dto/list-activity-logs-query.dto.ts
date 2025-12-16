import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListActivityLogsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by action (case-insensitive search)',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity type',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter logs created on or after this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter logs created on or before this date (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

