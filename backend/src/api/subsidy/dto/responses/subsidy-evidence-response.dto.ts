import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubsidyEvidenceType } from 'prisma/generated/prisma/enums';

export class SubsidyEvidenceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subsidyId!: string;

  @ApiProperty({ enum: SubsidyEvidenceType })
  type!: SubsidyEvidenceType;

  @ApiProperty()
  storageUrl!: string;

  @ApiPropertyOptional()
  fileName?: string | null;

  @ApiPropertyOptional()
  mimeType?: string | null;

  @ApiPropertyOptional()
  fileSize?: number | null;

  @ApiProperty()
  @Type(() => Date)
  uploadedAt!: Date;

  constructor(partial: Partial<SubsidyEvidenceResponseDto>) {
    Object.assign(this, partial);
  }
}
