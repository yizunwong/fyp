import { ApiProperty } from '@nestjs/swagger';
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
}
