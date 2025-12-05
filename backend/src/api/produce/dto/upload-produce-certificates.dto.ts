import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum } from 'class-validator';
import { CertificationType } from 'prisma/generated/prisma/enums';

export class UploadProduceCertificatesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'One or more certificate files (PDF/image) to pin on IPFS.',
  })
  certificates!: string[];

  @ApiProperty({
    description:
      'Certification type for each uploaded file. The length must match the number of files.',
    enum: CertificationType,
    isArray: true,
    type: 'string',
  })
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value != null ? [value] : [],
  )
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(CertificationType, { each: true })
  types!: CertificationType[];
}
