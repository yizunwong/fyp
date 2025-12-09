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

  @ApiPropertyOptional({
    description: 'Original file name',
    type: String,
    nullable: true,
  })
  fileName?: string | null;

  @ApiPropertyOptional({
    description: 'MIME type of the uploaded file',
    type: String,
    nullable: true,
  })
  mimeType?: string | null;

  @ApiPropertyOptional({
    description: 'Size of the uploaded file in bytes',
    type: Number,
    nullable: true,
  })
  fileSize?: number | null;

  @ApiProperty()
  @Type(() => Date)
  uploadedAt!: Date;

  constructor(partial: Partial<SubsidyEvidenceResponseDto>) {
    Object.assign(this, partial);
  }
}
