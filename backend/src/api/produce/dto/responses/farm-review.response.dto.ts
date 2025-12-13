import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FarmReviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  produceId!: string;

  @ApiProperty()
  retailerId!: string;

  @ApiProperty()
  rating!: number;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  comment?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  batchId!: string;

  @ApiProperty()
  produceName!: string;

  @ApiPropertyOptional({
    description: 'Retailer username',
    nullable: true,
    type: String,
  })
  retailerName?: string | null;
}

export class FarmRatingSummaryDto {
  @ApiProperty()
  averageRating!: number;

  @ApiProperty()
  totalReviews!: number;
}

export class FarmReviewListResponseDto {
  @ApiProperty({ type: FarmReviewDto, isArray: true })
  reviews!: FarmReviewDto[];

  @ApiProperty({ type: FarmRatingSummaryDto })
  summary!: FarmRatingSummaryDto;
}
