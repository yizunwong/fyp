import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherAlertResponseDto } from './dto/responses/weather-alert-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('alerts')
  @ApiOperation({
    summary: 'Get weather alerts (filtered by location name if provided)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of alerts per page (default: 5)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description:
      'Filter by location name (e.g., "Kuala Terengganu", "Langkawi")',
  })
  @ApiCommonResponse(WeatherAlertResponseDto, true, 'Weather alerts retrieved')
  async getWeatherAlerts(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('location') location?: string,
  ): Promise<CommonResponseDto<WeatherAlertResponseDto[]>> {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    const pageNum = page ? parseInt(page, 10) : 1;
    const result = await this.weatherService.getWeatherAlerts(
      limitNum,
      pageNum,
      location,
    );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Weather alerts retrieved successfully',
      data: result?.alerts ?? [],
      count: result?.total ?? 0,
    });
  }
}
