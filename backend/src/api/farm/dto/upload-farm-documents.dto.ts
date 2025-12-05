import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { LandDocumentType } from 'prisma/generated/prisma/enums';

export class UploadFarmDocumentsDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Upload multiple land documents.',
  })
  documents!: string[];

  @ApiProperty({
    description: 'Document type for each uploaded document.',
    type: 'string',
    enum: LandDocumentType,
    isArray: true,
  })
  @Transform(({ value }) => {
    if (!value && value !== 0) return [];
    if (Array.isArray(value)) return value;
    return [value];
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(LandDocumentType, { each: true })
  types!: LandDocumentType[];
}
