import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProduceStatus } from 'prisma/generated/prisma/enums';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetFarmQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by produce name or batch ID (case-insensitive)',
    example: 'mango',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter produce by status',
    enum: ProduceStatus,
    example: ProduceStatus.ONCHAIN_CONFIRMED,
  })
  @IsOptional()
  @IsEnum(ProduceStatus)
  status?: ProduceStatus;

  @ApiPropertyOptional({
    description: 'Filter produce harvested on or after this date (ISO string)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  harvestFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter produce harvested on or before this date (ISO string)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  harvestTo?: string;
}
