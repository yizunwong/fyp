import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProduceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  farmId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  batchId!: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  certifications?: Record<string, any>;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  harvestDate!: string; // ISO string
}
