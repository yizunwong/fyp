import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/client';
import {
  CertificationType,
  ProduceStatus,
  ProduceUnit,
} from 'prisma/generated/prisma/enums';

export class ProduceCertificateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  produceId!: string;

  @ApiProperty({
    description: 'Certificate label/type (e.g., Organic, Halal).',
  })
  type!: CertificationType;

  @ApiProperty({
    description: 'IPFS gateway URL pointing to the uploaded certificate.',
  })
  ipfsUrl!: string;

  @ApiProperty({ description: 'Whether this certificate is verified on-chain' })
  verifiedOnChain!: boolean;

  @ApiPropertyOptional({
    description: 'When the certificate was issued (if provided).',
    type: () => Date,
    nullable: true,
  })
  issuedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Arbitrary metadata stored with the certificate',
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  metadata?: JsonValue | null;

  @ApiPropertyOptional({
    description: 'Original file name as uploaded',
    nullable: true,
  })
  fileName?: string | null;

  @ApiPropertyOptional({
    description: 'MIME type of the uploaded file',
    nullable: true,
  })
  mimeType?: string | null;

  @ApiPropertyOptional({
    description: 'Size of the uploaded file in bytes',
    nullable: true,
  })
  fileSize?: number | null;

  @ApiProperty({ description: 'Timestamp when the certificate was created' })
  createdAt!: Date;
}

export class QRCodeDto {
  @ApiProperty({ description: 'Unique ID of the QR code' })
  id!: string;

  @ApiProperty({ description: 'ID of the associated produce' })
  produceId!: string;

  @ApiProperty({ description: 'URL used to generate the QR code' })
  verifyUrl!: string;

  @ApiProperty({ description: 'Image URL of the QR code' })
  imageUrl!: string;

  @ApiPropertyOptional({
    description: 'Optional QR hash for verification',
    nullable: true,
  })
  qrHash?: string | null;

  @ApiProperty({ description: 'Indicates if the QR is publicly shareable' })
  isPublicQR!: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;
}

export class ProduceListResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  batchId!: string;

  @ApiProperty({ type: () => ProduceCertificateDto, isArray: true })
  certifications!: ProduceCertificateDto[];

  @ApiProperty()
  harvestDate!: Date;

  @ApiProperty({ type: String, nullable: true })
  blockchainTx!: string | null;

  @ApiProperty({
    description: 'Current lifecycle status of the produce batch',
    enum: ProduceStatus,
    default: ProduceStatus.DRAFT,
  })
  status!: ProduceStatus;

  @ApiProperty({ type: String, nullable: true })
  retailerId!: string | null;

  @ApiPropertyOptional({
    description: 'Recorded quantity of the produce batch',
    example: 150,
  })
  quantity?: number;

  @ApiProperty({
    description: 'Unit used for the recorded quantity',
    enum: ProduceUnit,
    default: ProduceUnit.KG,
  })
  unit!: ProduceUnit;

  @ApiPropertyOptional({
    description: 'Image URL for the produce batch',
    type: String,
    nullable: true,
  })
  imageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Data URI for the QR code',
    type: QRCodeDto,
    nullable: true,
  })
  qrCode?: QRCodeDto | null;
}
