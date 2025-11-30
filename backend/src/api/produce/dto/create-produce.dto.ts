import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsObject,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ProduceUnit } from 'prisma/generated/prisma/enums';

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

  @ApiPropertyOptional({
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  certifications?: Record<string, any>;

  @ApiPropertyOptional({
    description:
      'Allow anyone to scan this batch QR publicly. Defaults to true.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublicQR?: boolean;
}
