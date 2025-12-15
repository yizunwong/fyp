import { ApiProperty } from '@nestjs/swagger';

export class SubsidyStatsDto {
  @ApiProperty({ description: 'Total subsidy applications made by the farmer' })
  totalApplied!: number;

  @ApiProperty({ description: 'Subsidy applications approved' })
  approved!: number;

  @ApiProperty({ description: 'Subsidy applications pending review' })
  pending!: number;

  @ApiProperty({ description: 'Subsidy applications rejected' })
  rejected!: number;

  @ApiProperty({
    description: 'Total subsidy amount received (disbursed) by the farmer',
  })
  totalSubsidiesReceived!: number;
}
