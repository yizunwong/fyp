import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty({
    description: 'Action performed (e.g., "CREATE_FARM", "UPDATE_PRODUCE")',
  })
  @IsString()
  action!: string;

  @ApiPropertyOptional({
    description: 'Entity type (e.g., "Farm", "Produce", "Subsidy")',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Entity ID',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Additional details as JSON',
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'IP address of the user',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

