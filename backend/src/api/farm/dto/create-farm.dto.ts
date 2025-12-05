import { ApiProperty } from '@nestjs/swagger';
import { AreaUnit } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';

export class CreateFarmDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  district!: string;

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

  @ApiProperty()
  @IsOptional()
  @IsObject()
  documents?: Record<string, any>;
}
