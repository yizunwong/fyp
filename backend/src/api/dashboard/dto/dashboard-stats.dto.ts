import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Count of available batches' })
  availableBatches!: number;

  @ApiProperty({ description: 'Count of orders created this month' })
  ordersThisMonth!: number;

  @ApiProperty({ description: 'Average rating across farms' })
  averageRating!: number;

  @ApiProperty({ description: 'Number of suppliers (farms)' })
  totalSuppliers!: number;
}
