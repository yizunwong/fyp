import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProgramStatus } from 'prisma/generated/prisma/enums';

export class UpdateProgramStatusDto {
  @ApiProperty({ enum: ProgramStatus })
  @IsEnum(ProgramStatus)
  status!: ProgramStatus;
}
