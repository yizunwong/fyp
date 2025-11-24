import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { LandDocumentType } from 'prisma/generated/prisma/enums';

export class UploadFarmDocumentsDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'One or more land documents to upload to IPFS/Pinata.',
  })
  documents!: string[];

  @ApiPropertyOptional({
    description:
      'Document type applied to all uploaded files in this request. Defaults to OTHERS.',
    enum: LandDocumentType,
  })
  @IsOptional()
  @IsEnum(LandDocumentType)
  type?: LandDocumentType;
}
