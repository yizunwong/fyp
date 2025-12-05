import { ApiProperty } from '@nestjs/swagger';
import { AreaUnit } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/client';
import { FarmVerificationStatus } from 'prisma/generated/prisma/enums';
import { ProduceListResponseDto } from 'src/api/produce/dto/responses/produce-list.dto';

export class FarmListRespondDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  address!: string;

  @ApiProperty()
  state!: string;

  @ApiProperty()
  district!: string;

  @ApiProperty({ description: 'Farm size value' })
  size!: number;

  @ApiProperty({
    description: 'Unit for the recorded farm size',
    enum: AreaUnit,
  })
  sizeUnit!: AreaUnit;

  @ApiProperty()
  produceCategories!: string[];

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Any valid JSON object or value',
  })
  documents?: JsonValue;

  @ApiProperty({
    enum: FarmVerificationStatus,
    description: 'Verification status set by government agency',
  })
  verificationStatus!: FarmVerificationStatus;

  @ApiProperty({ type: () => ProduceListResponseDto, isArray: true })
  produces?: ProduceListResponseDto[];
}
