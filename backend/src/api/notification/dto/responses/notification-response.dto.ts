import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/client';
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

  @ApiPropertyOptional({ type: Date, nullable: true })
  readAt?: Date | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  relatedEntityType?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  relatedEntityId?: string | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  metadata?: JsonValue | null;

  @ApiProperty()
  createdAt!: Date;
}
