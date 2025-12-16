import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType, ReportStatus } from 'prisma/generated/prisma/enums';

export class ReportResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ReportType })
  reportType!: ReportType;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  parameters?: Record<string, unknown>;

  @ApiPropertyOptional()
  fileUrl?: string;

  @ApiProperty({ enum: ReportStatus })
  status!: ReportStatus;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiPropertyOptional()
  generatedAt?: Date;

  @ApiProperty()
  createdAt!: Date;
}

