import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RateFarmDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    example: 'Excellent quality and timely delivery',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
