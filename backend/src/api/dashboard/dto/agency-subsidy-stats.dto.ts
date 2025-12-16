import { ApiProperty } from '@nestjs/swagger';

export class AgencySubsidyStatsDto {
  @ApiProperty({ description: 'Subsidies pending review' })
  pending!: number;

  @ApiProperty({ description: 'Subsidies approved and ready to disburse' })
  approved!: number;

  @ApiProperty({ description: 'Subsidies disbursed (funds paid out)' })
  disbursed!: number;

  @ApiProperty({ description: 'Subsidies rejected' })
  rejected!: number;
}

