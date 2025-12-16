import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from 'prisma/generated/prisma/enums';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'User ID to send notification to',
  })
  @IsString()
  userId!: string;

  @ApiProperty({
    enum: NotificationType,
    description: 'Type of notification',
  })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({
    description: 'Notification title',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Notification message',
  })
  @IsString()
  message!: string;

  @ApiPropertyOptional({
    description: 'Related entity type (e.g., "Farm", "Subsidy")',
  })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiPropertyOptional({
    description: 'Related entity ID',
  })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

