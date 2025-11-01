import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProduceStatus, ProduceUnit } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export class CreateProduceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  batchId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ enum: ProduceUnit })
  unit!: ProduceUnit;

  @ApiProperty({ type: () => Date })
  harvestDate!: Date;

  @ApiPropertyOptional({
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  certifications?: JsonValue | null;

  @ApiProperty({ enum: ProduceStatus })
  status!: ProduceStatus;

  @ApiPropertyOptional({ type: String, nullable: true })
  blockchainTx?: string | null;

  @ApiProperty()
  isPublicQR!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  retailerId?: string | null;

  @ApiProperty({ type: () => Date })
  createdAt!: Date;

  @ApiProperty({
    description: 'QR code in data URL format that can be rendered directly',
  })
  qrCode!: string;

  @ApiProperty({
    example:
      'Produce recorded successfully on-chain with QR code and blockchain proof.',
  })
  message!: string;

  constructor(partial: Partial<CreateProduceResponseDto>) {
    Object.assign(this, partial);
  }
}
