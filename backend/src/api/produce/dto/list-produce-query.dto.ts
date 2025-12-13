import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ProduceStatus } from 'prisma/generated/prisma/enums';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListProduceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter produce batches by status',
    enum: ProduceStatus,
    example: ProduceStatus.ARRIVED,
  })
  @IsOptional()
  @IsEnum(ProduceStatus)
  status?: ProduceStatus;

  @ApiPropertyOptional({
    description: 'Search by produce name, farm name, or batch ID (case-insensitive)',
    example: 'mango',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter batches harvested on or after this date (ISO string)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  harvestFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter batches harvested on or before this date (ISO string)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  harvestTo?: string;
}
