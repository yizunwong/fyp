import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CertificationType } from 'prisma/generated/prisma/enums';

export class UploadProduceCertificatesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'One or more certificate files (PDF/image) to pin on IPFS.',
  })
  certificates!: string[];

  @ApiPropertyOptional({
    description:
      'Certification label applied to all files in this request. Defaults to ORGANIC.',
    enum: CertificationType,
  })
  @IsOptional()
  @IsEnum(CertificationType)
  type?: CertificationType;
}
