import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AreaUnit } from 'prisma/generated/prisma/enums';
import { FarmVerificationStatus } from 'prisma/generated/prisma/enums';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListFarmQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter farms by name (case-insensitive)',
    example: 'Green Valley Farm',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description:
      'Match address, district, or state (case-insensitive partial match)',
    example: 'Selangor',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Minimum farm size',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minSize?: number;

  @ApiPropertyOptional({
    description: 'Maximum farm size',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxSize?: number;

  @ApiPropertyOptional({
    description: 'Filter by verification status',
    enum: FarmVerificationStatus,
    example: FarmVerificationStatus.VERIFIED,
  })
  @IsOptional()
  @IsEnum(FarmVerificationStatus)
  status?: FarmVerificationStatus;

  @ApiPropertyOptional({
    description: 'Filter by produce category the farm grows',
    example: 'Vegetable',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Unit for the provided size filters',
    enum: AreaUnit,
    example: AreaUnit.HECTARE,
  })
  @IsOptional()
  @IsEnum(AreaUnit)
  sizeUnit?: AreaUnit;
}
