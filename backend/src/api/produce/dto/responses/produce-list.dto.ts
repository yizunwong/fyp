import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProduceStatus, ProduceUnit } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

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

  @ApiProperty()
  certifications!: JsonValue;

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
