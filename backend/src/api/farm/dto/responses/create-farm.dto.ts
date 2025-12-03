import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';
import { AreaUnit, FarmVerificationStatus } from 'prisma/generated/prisma/enums';

export class CreateFarmResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty({ description: 'Farm size value' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  size!: number;

  @ApiProperty({
    description: 'Unit for the farm size measurement',
    enum: AreaUnit,
    example: AreaUnit.HECTARE,
  })
  @IsNotEmpty()
  @IsEnum(AreaUnit)
  sizeUnit!: AreaUnit;

  @ApiProperty({
    type: [String],
    description: 'Produce categories grown on the farm',
    example: ['Paddy', 'Vegetable'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  produceCategories!: string[];

  @ApiProperty({
    enum: FarmVerificationStatus,
    description: 'Verification status set by government agency',
  })
  @IsEnum(FarmVerificationStatus)
  verificationStatus!: FarmVerificationStatus;

  constructor(partial: Partial<CreateFarmResponseDto>) {
    Object.assign(this, partial);
  }
}
