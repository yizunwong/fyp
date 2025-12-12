import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProduceService } from '../produce/produce.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { RateFarmDto } from './dto/rate-farm.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { ProduceListResponseDto } from '../produce/dto/responses/produce-list.dto';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';

@ApiTags('Retailer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('retailer')
export class RetailerController {
  constructor(private readonly produceService: ProduceService) {}

  @Get('batches')
  @Roles(Role.RETAILER)
  @ApiCommonResponse(
    ProduceListResponseDto,
    true,
    'Assigned produce batches retrieved',
  )
  async listAssignedBatches(
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<ProduceListResponseDto[]>> {
    const batches = await this.produceService.listBatchesForRetailer(
      req.user.id,
      req.user.role,
    );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Assigned produce batches retrieved successfully',
      data: batches,
      count: batches.length,
    });
  }

  @Post('verify/:batchId')
  @Roles(Role.RETAILER)
  verifyBatch(@Param('batchId') batchId: string, @Req() req: RequestWithUser) {
    return this.produceService.retailerVerifyProduce(batchId, {
      id: req.user.id,
      role: req.user.role,
    });
  }

  @Post('farms/:farmId/rate')
  @Roles(Role.RETAILER)
  rateFarm(
    @Param('farmId') farmId: string,
    @Body() dto: RateFarmDto,
    @Req() req: RequestWithUser,
  ) {
    return this.produceService.rateFarm(
      farmId,
      req.user.id,
      dto.rating,
      dto.comment,
      req.user.role,
    );
  }
}
