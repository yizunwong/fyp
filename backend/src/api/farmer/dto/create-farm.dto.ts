import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFarmDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  farmerId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  documents?: Record<string, any>;
}
