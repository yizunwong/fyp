import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ProgramStatus } from 'prisma/generated/prisma/enums';

export class UpdateProgramStatusDto {
  @ApiProperty({ enum: ProgramStatus })
  @IsEnum(ProgramStatus)
  status!: ProgramStatus;

  @ApiPropertyOptional({ description: 'On-chain identifier for the program' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  onchainId?: number;
}
