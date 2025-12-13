import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { ProduceService } from './produce.service';
import { FarmReviewListResponseDto } from './dto/responses/farm-review.response.dto';

@ApiTags('Farm Reviews')
@Controller('farms')
export class FarmReviewController {
  constructor(private readonly produceService: ProduceService) {}

  @Get(':farmId/reviews')
  @ApiCommonResponse(FarmReviewListResponseDto, false, 'Farm reviews retrieved')
  async listFarmReviews(
    @Param('farmId') farmId: string,
  ): Promise<CommonResponseDto<FarmReviewListResponseDto>> {
    const { reviews, summary } = await this.produceService.listFarmReviews(
      farmId,
    );

    const response = new FarmReviewListResponseDto();
    response.reviews = reviews.map((review) => ({
      id: review.id,
      farmId: review.farmId,
      produceId: review.produceId,
      retailerId: review.retailerId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      batchId: review.produce.batchId,
      produceName: review.produce.name,
      retailerName: review.retailer?.user?.username ?? null,
    }));
    response.summary = summary;

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farm reviews retrieved successfully',
      data: response,
    });
  }
}
