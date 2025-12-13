import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProduceService } from '../produce/produce.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { ProduceListResponseDto } from '../produce/dto/responses/produce-list.dto';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { RetailerService } from './retailer.service';
import { RetailerProfileListResponseDto } from './dto/responses/retailer-profile.response.dto';
import { ListProduceQueryDto } from '../produce/dto/list-produce-query.dto';
import { ProduceStatus } from 'prisma/generated/prisma/enums';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('Retailer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('retailer')
export class RetailerController {
  constructor(
    private readonly produceService: ProduceService,
    private readonly retailerService: RetailerService,
  ) {}

  @Get('batches')
  // @Roles(Role.RETAILER)
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProduceStatus,
    description: 'Optional status filter for produce batches',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by produce name, farm name, or batch ID',
  })
  @ApiQuery({
    name: 'harvestFrom',
    required: false,
    description:
      'ISO date string: include batches harvested on/after this date',
  })
  @ApiQuery({
    name: 'harvestTo',
    required: false,
    description:
      'ISO date string: include batches harvested on/before this date',
  })
  @ApiCommonResponse(
    ProduceListResponseDto,
    true,
    'Assigned produce batches retrieved',
  )
  async listAssignedBatches(
    @Query() query: ListProduceQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<ProduceListResponseDto[]>> {
    const batches = await this.produceService.listBatchesForRetailer(
      req.user.id,
      query,
    );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Assigned produce batches retrieved successfully',
      data: batches,
      count: batches.length,
    });
  }

  @Post('verify/:batchId')
  // @Roles(Role.RETAILER)
  verifyBatch(@Param('batchId') batchId: string, @Req() req: RequestWithUser) {
    return this.produceService.retailerVerifyProduce(batchId, req.user.id);
  }

  @Get('profiles')
  @ApiCommonResponse(
    RetailerProfileListResponseDto,
    true,
    'Retailers with profiles retrieved',
  )
  async listRetailerProfiles(): Promise<
    CommonResponseDto<RetailerProfileListResponseDto[]>
  > {
    const retailers = await this.retailerService.listRetailersWithProfile();
    const data: RetailerProfileListResponseDto[] = retailers.map(
      (retailer) => ({
        id: retailer.user.id,
        email: retailer.user.email,
        username: retailer.user.username,
        role: retailer.user.role,
        companyName: retailer.companyName,
        businessAddress: retailer.businessAddress,
        verified: retailer.verified,
      }),
    );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Retailers with profiles retrieved',
      data,
      count: data.length,
    });
  }
}
