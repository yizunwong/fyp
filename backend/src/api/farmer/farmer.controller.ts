import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
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
import { CreateProduceResponseDto } from '../produce/dto/responses/create-produce.dto';
import { RequestWithUser } from '../auth/types/request-with-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Farmer')
@UseGuards(JwtAuthGuard)
@Controller('farmer')
export class FarmerController {
  constructor(
    private readonly farmService: FarmService,
    private readonly subsidyService: SubsidyService,
    private readonly produceService: ProduceService,
  ) {}
  @Post('/farm')
  createFarm(@Req() req: RequestWithUser, @Body() dto: CreateFarmDto) {
    return this.farmService.createFarm(req.user.id, dto);
  }

  @Get('/farm')
  @ApiCommonResponse(FarmListRespondDto, true, 'Farms retrieved successfully')
  async findFarms(
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<FarmListRespondDto[]>> {
    console.log('req.user.id', req.user);
    const farms = await this.farmService.listFarms(req.user.id);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farms retrieved successfully',
      data: farms,
      count: farms.length,
    });
  }

  @Get('/farm/:farmId')
  @ApiCommonResponse(
    FarmDetailResponseDto,
    false,
    'Farm retrieved successfully',
  )
  async findFarm(
    @Req() req: RequestWithUser,
    @Param('farmId') farmId: string,
  ): Promise<CommonResponseDto<FarmDetailResponseDto>> {
    const farm = await this.farmService.getFarm(req.user.id, farmId);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farm retrieved successfully',
      data: farm,
    });
  }

  @Patch('/farm/:farmId')
  updateFarm(
    @Req() req: RequestWithUser,
    @Param('farmId') farmId: string,
    @Body() dto: UpdateFarmDto,
  ) {
    return this.farmService.updateFarm(req.user.id, farmId, dto);
  }

  @Delete('farm/:farmId')
  deleteFarm(@Req() req: RequestWithUser, @Param('farmId') farmId: string) {
    return this.farmService.deleteFarm(req.user.id, farmId);
  }

  @Post('subsidy')
  createSubsidy(@Req() req: RequestWithUser, @Body() dto: RequestSubsidyDto) {
    return this.subsidyService.requestSubsidy(req.user.id, dto);
  }

  @Get('subsidy')
  findSubsidies(@Req() req: RequestWithUser) {
    return this.subsidyService.listSubsidies(req.user.id);
  }

  @Post(':id/farms/:farmId/produce')
  @ApiCommonResponse(
    CreateProduceResponseDto,
    false,
    'Produce created successfully',
  )
  async createProduce(
    @Param('id') farmerId: string,
    @Param('farmId') farmId: string,
    @Body() dto: CreateProduceDto,
  ): Promise<CommonResponseDto<CreateProduceResponseDto>> {
    const produce = await this.produceService.createProduce(
      farmerId,
      farmId,
      dto,
    );
    return new CommonResponseDto({
      statusCode: 201,
      message: produce.message,
      data: produce,
    });
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
