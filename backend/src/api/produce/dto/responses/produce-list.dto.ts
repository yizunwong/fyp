import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProduceStatus, ProduceUnit } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

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

  @ApiProperty({
    description: 'Whether this batch QR can be scanned publicly',
    default: true,
  })
  isPublicQR!: boolean;
}
