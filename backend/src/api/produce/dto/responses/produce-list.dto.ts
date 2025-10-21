import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProduceUnit } from '@prisma/client';
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

  @ApiProperty()
  blockchainTx!: string | null;

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
}
