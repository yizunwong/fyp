import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ReportStatus } from 'prisma/generated/prisma/enums';

export class UpdateReportDto {
  @ApiPropertyOptional({
    enum: ReportStatus,
    description: 'Updated report status',
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({
    description: 'URL or path to the generated report file',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'Error message if report generation failed',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}

