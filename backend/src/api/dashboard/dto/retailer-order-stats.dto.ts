import { ApiProperty } from '@nestjs/swagger';

export class RetailerOrderStatsDto {
  @ApiProperty({ description: 'Total orders placed by the retailer' })
  totalOrders!: number;

  @ApiProperty({ description: 'Active (in-progress) orders' })
  active!: number;

  @ApiProperty({ description: 'Delivered (retailer verified) orders' })
  delivered!: number;
}
