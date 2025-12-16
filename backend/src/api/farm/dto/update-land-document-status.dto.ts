import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLandDocumentStatusDto {
  @ApiPropertyOptional({
    description: 'Reason for rejection (required if status is REJECTED)',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
