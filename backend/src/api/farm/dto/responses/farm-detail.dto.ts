import { ApiProperty } from '@nestjs/swagger';
import { AreaUnit } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { ProduceListResponseDto } from 'src/api/produce/dto/responses/produce-list.dto';

export class FarmDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty({ description: 'Farm size value' })
  size!: number;

  @ApiProperty({
    description: 'Unit for the recorded farm size',
    enum: AreaUnit,
  })
  sizeUnit!: AreaUnit;

  @ApiProperty()
  produceCategories!: string[];

  @ApiProperty()
  documents?: JsonValue;

  @ApiProperty({ description: 'Owner of the farm' })
  farmerId!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: () => [ProduceListResponseDto] })
  produces?: ProduceListResponseDto[];
}
