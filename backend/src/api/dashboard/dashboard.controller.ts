import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProduceStatus } from 'prisma/generated/prisma/client';
import { RetailerOrderStatsDto } from './dto/retailer-order-stats.dto';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  @ApiCommonResponse(DashboardStatsDto, false, 'Dashboard stats retrieved')
  async getStats(): Promise<CommonResponseDto<DashboardStatsDto>> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [availableBatches, ordersThisMonth, farmsAggregate] = await Promise.all([
      this.prisma.produce.count({
        where: {
          status: ProduceStatus.ONCHAIN_CONFIRMED,
          retailerId: null,
        },
      }),
      this.prisma.produce.count({
        where: {
          retailerId: { not: null },
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      this.prisma.farm.aggregate({
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);

    const stats: DashboardStatsDto = {
      availableBatches,
      ordersThisMonth,
      averageRating: Number(farmsAggregate._avg.rating ?? 0),
      totalSuppliers: farmsAggregate._count.id,
    };

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Dashboard stats retrieved successfully',
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

    const [totalOrders, active, delivered] = await Promise.all([
      this.prisma.produce.count({ where: { retailerId } }),
      this.prisma.produce.count({
        where: {
          retailerId,
          status: {
            in: [
              ProduceStatus.PENDING_CHAIN,
              ProduceStatus.ONCHAIN_CONFIRMED,
              ProduceStatus.IN_TRANSIT,
              ProduceStatus.ARRIVED,
            ],
          },
        },
      }),
      this.prisma.produce.count({
        where: { retailerId, status: ProduceStatus.RETAILER_VERIFIED },
      }),
    ]);

    const data: RetailerOrderStatsDto = {
      totalOrders,
      active,
      delivered,
    };

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Retailer order stats retrieved successfully',
      data,
    });
  }
}
