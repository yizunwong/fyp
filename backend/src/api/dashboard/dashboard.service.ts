import { Injectable } from '@nestjs/common';
import {
  ProduceStatus,
  ProgramStatus,
  SubsidyStatus,
} from 'prisma/generated/prisma/enums';

import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RetailerOrderStatsDto } from './dto/retailer-order-stats.dto';
import { FarmerStatsDto } from './dto/farmer-stats.dto';
import { ProgramStatsDto } from './dto/program-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getRetailerDashboardStats(
    retailerId: string,
  ): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [
      availableBatches,
      ordersThisMonth,
      retailerReviewAggregate,
      supplierFarms,
    ] = await Promise.all([
      this.prisma.produce.count({
        where: {
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
      this.prisma.farmReview.aggregate({
        _avg: { rating: true },
        where: { retailerId },
      }),
      this.prisma.produce.findMany({
        where: { retailerId },
        distinct: ['farmId'],
        select: { farmId: true },
      }),
    ]);

    return {
      availableBatches,
      ordersThisMonth,
      averageRating: Number(retailerReviewAggregate._avg?.rating ?? 0),
      totalSuppliers: supplierFarms.length,
    };
  }

  async getRetailerOrderStats(
    retailerId: string,
  ): Promise<RetailerOrderStatsDto> {
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

    return {
      totalOrders,
      active,
      delivered,
    };
  }

  async getProgramStats(agencyId: string): Promise<ProgramStatsDto> {
    const [activePrograms, draftPrograms, archivedPrograms, totalPrograms] =
      await Promise.all([
        this.prisma.program.count({
          where: { createdBy: agencyId, status: 'ACTIVE' as ProgramStatus },
        }),
        this.prisma.program.count({
          where: { createdBy: agencyId, status: 'DRAFT' as ProgramStatus },
        }),
        this.prisma.program.count({
          where: { createdBy: agencyId, status: 'ARCHIVED' as ProgramStatus },
        }),
        this.prisma.program.count(),
      ]);

    return {
      activePrograms,
      draftPrograms,
      archivedPrograms,
      totalPrograms,
    };
  }

  async getFarmerStats(farmerId: string): Promise<FarmerStatsDto> {
    const activeStatuses: ProduceStatus[] = [
      ProduceStatus.PENDING_CHAIN,
      ProduceStatus.ONCHAIN_CONFIRMED,
      ProduceStatus.IN_TRANSIT,
      ProduceStatus.ARRIVED,
    ];

    const [
      totalFarms,
      activeBatches,
      verifiedRecords,
      subsidyAggregate,
      recentProduce,
      subsidies,
    ] = await Promise.all([
      this.prisma.farm.count({ where: { farmerId } }),
      this.prisma.produce.count({
        where: { farm: { farmerId }, status: { in: activeStatuses } },
      }),
      this.prisma.produce.count({
        where: {
          farm: { farmerId },
          status: ProduceStatus.RETAILER_VERIFIED,
        },
      }),
      this.prisma.subsidy.aggregate({
        where: {
          farmerId,
          status: { in: [SubsidyStatus.APPROVED, SubsidyStatus.DISBURSED] },
        },
        _sum: { amount: true },
      }),
      this.prisma.produce.findMany({
        where: { farm: { farmerId } },
        select: {
          name: true,
          batchId: true,
          quantity: true,
          unit: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      this.prisma.subsidy.findMany({
        where: { farmerId },
        select: {
          amount: true,
          status: true,
          programs: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    return {
      totalFarms,
      activeBatches,
      verifiedRecords,
      subsidies: Number(subsidyAggregate._sum.amount ?? 0),
      recentProduce: recentProduce.map((produce) => ({
        name: produce.name,
        batch: produce.batchId,
        quantity: Number(produce.quantity ?? 0),
        unit: produce.unit,
        status: produce.status,
      })),
      subsidyStatus: subsidies.map((subsidy) => ({
        program: subsidy.programs?.name ?? 'Unknown Program',
        amount: Number(subsidy.amount ?? 0),
        status: subsidy.status,
      })),
    };
  }
}
