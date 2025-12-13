import { ApiProperty } from '@nestjs/swagger';

export class FarmerRecentProduceDto {
  @ApiProperty({ description: 'Produce name' })
  name!: string;

  @ApiProperty({ description: 'Batch identifier' })
  batch!: string;

  @ApiProperty({ description: 'Quantity for the batch' })
  quantity!: number;

  @ApiProperty({ description: 'Unit for the quantity (e.g. kg)' })
  unit!: string;

  @ApiProperty({ description: 'Current status for the batch' })
  status!: string;
}

export class FarmerSubsidyDto {
  @ApiProperty({ description: 'Subsidy program name' })
  program!: string;

  @ApiProperty({ description: 'Amount awarded or requested (in dollars)' })
  amount!: number;

  @ApiProperty({ description: 'Status of the subsidy' })
  status!: string;
}

export class FarmerStatsDto {
  @ApiProperty({ description: 'Total number of farms managed' })
  totalFarms!: number;

  @ApiProperty({ description: 'Number of active batches' })
  activeBatches!: number;

  @ApiProperty({ description: 'Number of verified records' })
  verifiedRecords!: number;

  @ApiProperty({ description: 'Total subsidies value in dollars' })
  subsidies!: number;

  @ApiProperty({
    description: 'List of recent produce batches',
    type: [FarmerRecentProduceDto],
  })
  recentProduce!: FarmerRecentProduceDto[];

  @ApiProperty({
    description: 'Current subsidy applications/statuses',
    type: [FarmerSubsidyDto],
  })
  subsidyStatus!: FarmerSubsidyDto[];
}
