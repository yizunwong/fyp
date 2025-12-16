import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Parameters/filters used to generate the report (JSON)',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;
}

