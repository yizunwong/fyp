import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from 'prisma/generated/prisma/enums';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListNotificationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by read status',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  read?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by notification type',
    enum: NotificationType,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Filter by related entity type',
  })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;
}

