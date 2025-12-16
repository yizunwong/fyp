import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from 'prisma/generated/prisma/enums';

export class NotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty()
  read!: boolean;

  @ApiPropertyOptional()
  readAt?: Date;

  @ApiPropertyOptional()
  relatedEntityType?: string;

  @ApiPropertyOptional()
  relatedEntityId?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty()
  createdAt!: Date;
}

