import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RequestSubsidyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  farmerId!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  weatherEventId?: string;
}
