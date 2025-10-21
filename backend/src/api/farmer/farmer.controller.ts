import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FarmService } from '../farm/farm.service';
import { CreateFarmDto } from '../farm/dto/create-farm.dto';
import { SubsidyService } from '../subsidy/subsidy.service';
import { RequestSubsidyDto } from '../subsidy/dto/request-subsidy.dto';
import { ProduceService } from '../produce/produce.service';
import { CreateProduceDto } from '../produce/dto/create-produce.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateFarmDto } from '../farm/dto/update-farm.dto';
import { FarmListRespondDto } from '../farm/dto/responses/farm-list.dto';
import { FarmDetailResponseDto } from '../farm/dto/responses/farm-detail.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { ProduceListResponseDto } from '../produce/dto/responses/produce-list.dto';

@ApiTags('Farmer')
@Controller('farmer')
export class FarmerController {
  constructor(
    private readonly farmService: FarmService,
    private readonly subsidyService: SubsidyService,
    private readonly produceService: ProduceService,
  ) {}
  @Post(':id/farm')
  createFarm(@Param('id') farmerId: string, @Body() dto: CreateFarmDto) {
    return this.farmService.createFarm(farmerId, dto);
  }

  @Get(':id/farm')
  @ApiCommonResponse(FarmListRespondDto, true, 'Farms retrieved successfully')
  async findFarms(
    @Param('id') farmerId: string,
  ): Promise<CommonResponseDto<FarmListRespondDto[]>> {
    const farms = await this.farmService.listFarms(farmerId);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farms retrieved successfully',
      data: farms,
      count: farms.length,
    });
  }

  @Get(':id/farm/:farmId')
  @ApiCommonResponse(
    FarmDetailResponseDto,
    false,
    'Farm retrieved successfully',
  )
  async findFarm(
    @Param('id') farmerId: string,
    @Param('farmId') farmId: string,
  ): Promise<CommonResponseDto<FarmDetailResponseDto>> {
    const farm = await this.farmService.getFarm(farmerId, farmId);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farm retrieved successfully',
      data: farm,
    });
  }

  @Patch(':id/farm/:farmId')
  updateFarm(
    @Param('id') farmerId: string,
    @Param('farmId') farmId: string,
    @Body() dto: UpdateFarmDto,
  ) {
    return this.farmService.updateFarm(farmerId, farmId, dto);
  }

  @Delete(':id/farm/:farmId')
  deleteFarm(@Param('id') farmerId: string, @Param('farmId') farmId: string) {
    return this.farmService.deleteFarm(farmerId, farmId);
  }

  @Post(':id/subsidy')
  createSubsidy(@Param('id') farmerId: string, @Body() dto: RequestSubsidyDto) {
    return this.subsidyService.requestSubsidy(farmerId, dto);
  }

  @Get(':id/subsidy')
  findSubsidies(@Param('id') farmerId: string) {
    return this.subsidyService.listSubsidies(farmerId);
  }

  @Post(':id/farms/:farmId/produce')
  createProduce(
    @Param('id') farmerId: string,
    @Param('farmId') farmId: string,
    @Body() dto: CreateProduceDto,
  ) {
    return this.produceService.createProduce(farmerId, farmId, dto);
  }

  @Get(':id/produce')
  @ApiCommonResponse(
    ProduceListResponseDto,
    true,
    'Produces retrieved successfully',
  )
  async findProduces(
    @Param('id') farmerId: string,
  ): Promise<CommonResponseDto<ProduceListResponseDto[]>> {
    const produces = await this.produceService.listProduce(farmerId);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Produces retrieved successfully',
      data: produces,
      count: produces.length,
    });
  }
}
