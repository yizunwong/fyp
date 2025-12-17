import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { ReportType } from 'prisma/generated/prisma/enums';

export class CreateReportDto {
  @ApiProperty({
    enum: ReportType,
    description: 'Type of report to generate',
  })
  @IsEnum(ReportType)
  reportType!: ReportType;

  @ApiProperty({
    description: 'Report title',
  })
  @IsString()
  title!: string;
}
