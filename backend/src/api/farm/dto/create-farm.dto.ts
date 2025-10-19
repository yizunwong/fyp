import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
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
  location!: string;

  @ApiProperty({ description: 'Farm size in hectares' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  size!: number;

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
