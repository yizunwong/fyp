import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Count of available batches' })
  availableBatches!: number;

  @ApiProperty({ description: 'Count of orders created this month' })
  ordersThisMonth!: number;

  @ApiProperty({ description: 'Average rating given by the retailer' })
  averageRating!: number;

  @ApiProperty({ description: 'Number of farms this retailer has been assigned from' })
  totalSuppliers!: number;
}
