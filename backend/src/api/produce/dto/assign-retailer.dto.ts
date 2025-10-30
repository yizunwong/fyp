import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignRetailerDto {
  @ApiProperty({
    description: 'Retailer user identifier',
    format: 'cuid',
  })
  @IsNotEmpty()
  @IsString()
  retailerId!: string;
}
