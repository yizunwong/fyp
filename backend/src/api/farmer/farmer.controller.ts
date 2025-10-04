import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FarmService } from '../farm/farm.service';
import { CreateFarmDto } from '../farm/dto/create-farm.dto';
import { SubsidyService } from '../subsidy/subsidy.service';
import { RequestSubsidyDto } from '../subsidy/dto/request-subsidy.dto';
import { ProduceService } from '../produce/produce.service';
import { CreateProduceDto } from '../produce/dto/create-produce.dto';
import { ApiTags } from '@nestjs/swagger';

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
  findFarms(@Param('id') farmerId: string) {
    return this.farmService.listFarms(farmerId);
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

  @Get(':id/farms/:farmId/produce')
  findProduces(@Param('id') farmerId: string, @Param('farmId') farmId: string) {
    return this.produceService.listProduce(farmerId, farmId);
  }
}
