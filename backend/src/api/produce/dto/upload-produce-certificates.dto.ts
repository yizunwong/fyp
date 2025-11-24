import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
      'Label to store for the uploaded certificates (applied to all files in this request).',
    default: 'GENERAL',
  })
  @IsOptional()
  @IsString()
  type?: string;
}
