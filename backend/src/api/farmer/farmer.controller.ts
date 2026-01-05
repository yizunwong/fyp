import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FarmService } from '../farm/farm.service';
import { CreateFarmDto } from '../farm/dto/create-farm.dto';
import { SubsidyService } from '../subsidy/subsidy.service';
import { RequestSubsidyDto } from '../subsidy/dto/request-subsidy.dto';
import { ProduceService } from '../produce/produce.service';
import { CreateProduceDto } from '../produce/dto/create-produce.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateFarmDto } from '../farm/dto/update-farm.dto';
import { FarmListRespondDto } from '../farm/dto/responses/farm-list.dto';
import { FarmDetailResponseDto } from '../farm/dto/responses/farm-detail.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { ProduceListResponseDto } from '../produce/dto/responses/produce-list.dto';
import { CreateProduceResponseDto } from '../produce/dto/responses/create-produce.dto';
import { RequestWithUser } from '../auth/types/request-with-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from 'prisma/generated/prisma/client';
import { CreateFarmResponseDto } from '../farm/dto/responses/create-farm.dto';
import { ListProduceQueryDto } from '../produce/dto/list-produce-query.dto';
import { ListFarmQueryDto } from '../farm/dto/list-farm-query.dto';
import { GetFarmQueryDto } from '../farm/dto/get-farm-query.dto';
import { ListSubsidiesQueryDto } from '../subsidy/dto/list-subsidies-query.dto';
import { SubsidyResponseDto } from '../subsidy/dto/responses/subsidy-response.dto';

@ApiTags('Farmer')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.FARMER)
@Controller('farmer')
export class FarmerController {
  constructor(
    private readonly farmService: FarmService,
    private readonly subsidyService: SubsidyService,
    private readonly produceService: ProduceService,
  ) {}
  @Post('/farm')
  @ApiCommonResponse(
    CreateFarmResponseDto,
    false,
    'Farms retrieved successfully',
  )
  async createFarm(
    @Req() req: RequestWithUser,
    @Body() dto: CreateFarmDto,
  ): Promise<CommonResponseDto<CreateFarmResponseDto>> {
    const farm = await this.farmService.createFarm(req.user.id, dto);
    return new CommonResponseDto({
      statusCode: 201,
      message: 'Farm created successfully',
      data: farm,
    });
  }

  @Get('/farm')
  @ApiCommonResponse(FarmListRespondDto, true, 'Farms retrieved successfully')
  async findFarms(
    @Req() req: RequestWithUser,
    @Query() query: ListFarmQueryDto,
  ): Promise<CommonResponseDto<FarmListRespondDto[]>> {
    const farms = await this.farmService.listFarms(req.user.id, query);
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
    @Query() query: GetFarmQueryDto,
  ): Promise<CommonResponseDto<FarmDetailResponseDto>> {
    const farm = await this.farmService.getFarm(req.user.id, farmId, query);
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
  @ApiCommonResponse(
    SubsidyResponseDto,
    true,
    'Subsidies retrieved successfully',
  )
  async findSubsidies(
    @Req() req: RequestWithUser,
    @Query() query: ListSubsidiesQueryDto,
  ): Promise<CommonResponseDto<SubsidyResponseDto[]>> {
    const { data, total } = await this.subsidyService.listSubsidies(
      req.user.id,
      query,
    );
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Subsidies retrieved successfully',
      data,
      count: total,
    });
  }

  @Post('/farms/:farmId/produce')
  @ApiCommonResponse(
    CreateProduceResponseDto,
    false,
    'Produce created successfully',
  )
  async createProduce(
    @Req() req: RequestWithUser,
    @Param('farmId') farmId: string,
    @Body() dto: CreateProduceDto,
  ): Promise<CommonResponseDto<CreateProduceResponseDto>> {
    const produce = await this.produceService.createProduce(
      req.user.id,
      farmId,
      dto,
    );
    return new CommonResponseDto({
      statusCode: 201,
      message: produce.message,
      data: produce,
    });
  }

  @Get('/produce')
  @ApiCommonResponse(
    ProduceListResponseDto,
    true,
    'Produces retrieved successfully',
  )
  async findProduces(
    @Req() req: RequestWithUser,
    @Query() query: ListProduceQueryDto,
  ): Promise<CommonResponseDto<ProduceListResponseDto[]>> {
    const produces = await this.produceService.listProduce(req.user.id, query);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Produces retrieved successfully',
      data: produces,
      count: produces.length,
    });
  }
}
