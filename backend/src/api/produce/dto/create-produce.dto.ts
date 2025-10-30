import { ApiProperty } from '@nestjs/swagger';
import { ProduceUnit } from '@prisma/client';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsObject,
  IsNotEmpty,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class CreateProduceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ProduceUnit)
  unit!: ProduceUnit;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsString()
  batchId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  harvestDate!: string;

  @IsOptional()
  @IsObject()
  certifications?: Record<string, any>;
}
