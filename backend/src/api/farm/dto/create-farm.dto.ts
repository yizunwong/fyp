import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject, IsNotEmpty } from 'class-validator';

export class CreateFarmDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location!: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  documents?: Record<string, any>;
}
