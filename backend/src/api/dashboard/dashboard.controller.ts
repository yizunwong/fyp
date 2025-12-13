import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RetailerOrderStatsDto } from './dto/retailer-order-stats.dto';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { FarmerStatsDto } from './dto/farmer-stats.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/retailer/stats')
  @ApiCommonResponse(DashboardStatsDto, false, 'Dashboard stats retrieved')
  async getStats(
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<DashboardStatsDto>> {
    const retailerId = req.user.id;

    const stats =
      await this.dashboardService.getRetailerDashboardStats(retailerId);

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
    });
  }

  @Get('/farmer/stats')
  @Roles(Role.FARMER)
  @ApiCommonResponse(FarmerStatsDto, false, 'Farmer stats retrieved')
  async getFarmerStats(
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<FarmerStatsDto>> {
    const stats = await this.dashboardService.getFarmerStats(req.user.id);

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farmer stats retrieved successfully',
      data: stats,
    });
  }

  @Get('retailer/order-stats')
  @Roles(Role.RETAILER)
  @ApiCommonResponse(
    RetailerOrderStatsDto,
    false,
    'Retailer order stats retrieved',
  )
  async getRetailerOrderStats(
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<RetailerOrderStatsDto>> {
    const retailerId = req.user.id;

    const data = await this.dashboardService.getRetailerOrderStats(retailerId);

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Retailer order stats retrieved successfully',
      data,
    });
  }
}
