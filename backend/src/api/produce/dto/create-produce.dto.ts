import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsObject,
  IsNotEmpty,
} from 'class-validator';

export class CreateProduceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

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
