import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveSubsidyDto {
  @ApiPropertyOptional({
    description: 'Optional notes or comments for the approval',
    type: String,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
