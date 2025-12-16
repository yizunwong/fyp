import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  action!: string;

  @ApiPropertyOptional()
  entityType?: string;

  @ApiPropertyOptional()
  entityId?: string;

  @ApiPropertyOptional()
  details?: Record<string, unknown>;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiProperty()
  createdAt!: Date;
}

