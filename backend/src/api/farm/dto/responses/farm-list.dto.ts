import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';
import { ProduceListResponseDto } from 'src/api/produce/dto/responses/produce-list.dto';

export class FarmListRespondDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty({ description: 'Farm size in hectares' })
  size!: number;

  @ApiProperty()
  produceCategories!: string[];

  @ApiProperty()
  documents?: JsonValue;

  @ApiProperty()
  produces?: ProduceListResponseDto[];
}
