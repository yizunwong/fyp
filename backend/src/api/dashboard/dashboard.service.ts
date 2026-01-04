import { Injectable } from '@nestjs/common';
import {
  FarmVerificationStatus,
  ProduceStatus,
  ProgramStatus,
  SubsidyStatus,
  LandDocumentVerificationStatus,
} from 'prisma/generated/prisma/enums';

import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RetailerOrderStatsDto } from './dto/retailer-order-stats.dto';
import { FarmerStatsDto } from './dto/farmer-stats.dto';
import { ProgramStatsDto } from './dto/program-stats.dto';
import { SubsidyStatsDto } from './dto/subsidy-stats.dto';
import { FarmVerificationStatsDto } from './dto/farm-verification-stats.dto';
import { AgencySubsidyStatsDto } from './dto/agency-subsidy-stats.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { AgencyDashboardDto } from './dto/agency-dashboard.dto';
import { Role } from '@prisma/client';

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
    const [activePrograms, draftPrograms, totalPrograms] = await Promise.all([
      this.prisma.program.count({
        where: { createdBy: agencyId, status: 'ACTIVE' as ProgramStatus },
      }),
      this.prisma.program.count({
        where: { createdBy: agencyId, status: 'DRAFT' as ProgramStatus },
      }),
      this.prisma.program.count(),
    ]);

    return {
      activePrograms,
      draftPrograms,
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

  async getFarmerSubsidyStats(farmerId: string): Promise<SubsidyStatsDto> {
    const [totalApplied, approved, pending, rejected, totalSubsidiesReceived] =
      await Promise.all([
        this.prisma.subsidy.count({ where: { farmerId } }),
        this.prisma.subsidy.count({
          where: {
            farmerId,
            status: SubsidyStatus.APPROVED,
          },
        }),
        this.prisma.subsidy.count({
          where: {
            farmerId,
            status: SubsidyStatus.PENDING,
          },
        }),
        this.prisma.subsidy.count({
          where: {
            farmerId,
            status: SubsidyStatus.REJECTED,
          },
        }),
        this.prisma.subsidy.aggregate({
          where: {
            farmerId,
            status: { in: [SubsidyStatus.APPROVED, SubsidyStatus.DISBURSED] },
          },
          _sum: { amount: true },
        }),
      ]);

    return {
      totalApplied,
      approved,
      pending,
      rejected,
      totalSubsidiesReceived: Number(totalSubsidiesReceived._sum.amount ?? 0),
    };
  }

  async getFarmVerificationStats(): Promise<FarmVerificationStatsDto> {
    const [pending, verified, rejected, documents] = await Promise.all([
      this.prisma.farm.count({
        where: { verificationStatus: FarmVerificationStatus.PENDING },
      }),
      this.prisma.farm.count({
        where: { verificationStatus: FarmVerificationStatus.VERIFIED },
      }),
      this.prisma.farm.count({
        where: { verificationStatus: FarmVerificationStatus.REJECTED },
      }),
      this.prisma.farmDocument.count({
        where: {
          farm: { verificationStatus: FarmVerificationStatus.PENDING },
        },
      }),
    ]);

    return {
      pending,
      verified,
      rejected,
      documents,
    };
  }

  async getAgencySubsidyStats(
    agencyId: string,
  ): Promise<AgencySubsidyStatsDto> {
    const [pending, approved, disbursed, rejected] = await Promise.all([
      this.prisma.subsidy.count({
        where: {
          programs: {
            createdBy: agencyId,
          },
          status: SubsidyStatus.PENDING,
        },
      }),
      this.prisma.subsidy.count({
        where: {
          programs: {
            createdBy: agencyId,
          },
          status: SubsidyStatus.APPROVED,
        },
      }),
      this.prisma.subsidy.count({
        where: {
          programs: {
            createdBy: agencyId,
          },
          status: SubsidyStatus.DISBURSED,
        },
      }),
      this.prisma.subsidy.count({
        where: {
          programs: {
            createdBy: agencyId,
          },
          status: SubsidyStatus.REJECTED,
        },
      }),
    ]);

    return {
      pending,
      approved,
      disbursed,
      rejected,
    };
  }

  async getUserStats(): Promise<UserStatsDto> {
    const [totalUsers, farmers, retailers, agencies, admins] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({
          where: { role: Role.FARMER },
        }),
        this.prisma.user.count({
          where: { role: Role.RETAILER },
        }),
        this.prisma.user.count({
          where: { role: Role.GOVERNMENT_AGENCY },
        }),
        this.prisma.user.count({
          where: { role: Role.ADMIN },
        }),
      ]);

    return {
      totalUsers,
      farmers,
      retailers,
      agencies,
      admins,
    };
  }

  async getAgencyDashboard(agencyId: string): Promise<AgencyDashboardDto> {
    const [
      pendingReview,
      onChain,
      approved,
      docsRequired,
      recentRegistrations,
      pendingClaimsData,
      activeProgramsData,
    ] = await Promise.all([
      // Farms pending review
      this.prisma.farm.count({
        where: { verificationStatus: FarmVerificationStatus.PENDING },
      }),
      // Subsidies that are on-chain (have onChainTxHash)
      this.prisma.subsidy.count({
        where: {
          programs: {
            createdBy: agencyId,
          },
          onChainTxHash: { not: null },
        },
      }),
      // Approved subsidies
      this.prisma.subsidy.count({
        where: {
          programs: {
            createdBy: agencyId,
          },
          status: SubsidyStatus.APPROVED,
        },
      }),
      // Documents requiring verification
      this.prisma.farmDocument.count({
        where: {
          verificationStatus: LandDocumentVerificationStatus.PENDING,
        },
      }),
      // Recent farm registrations (last 10)
      this.prisma.farm.findMany({
        select: {
          id: true,
          name: true,
          farmerId: true,
          address: true,
          state: true,
          district: true,
          verificationStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Pending subsidy claims with details
      this.prisma.subsidy.findMany({
        where: {
          programs: {
            createdBy: agencyId,
          },
          status: SubsidyStatus.PENDING,
        },
        include: {
          farmer: {
            include: {
              user: {
                select: {
                  username: true,
                },
              },
              farms: {
                where: {
                  state: { not: '' },
                },
                select: {
                  state: true,
                },
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          programs: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Active programs owned by the agency with details
      this.prisma.program.findMany({
        where: {
          createdBy: agencyId,
          status: 'ACTIVE' as ProgramStatus,
        },
        include: {
          payoutRule: {
            select: {
              amount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      pendingReview,
      onChain,
      approved,
      docsRequired,
      recentRegistrations: recentRegistrations.map((farm) => ({
        id: farm.id,
        name: farm.name,
        farmerId: farm.farmerId,
        address: farm.address,
        state: farm.state,
        district: farm.district,
        verificationStatus: farm.verificationStatus,
        createdAt: farm.createdAt,
      })),
      pendingClaims: pendingClaimsData.map((subsidy) => ({
        id: subsidy.id,
        programName: subsidy.programs?.name || 'Unknown Program',
        amount: Number(subsidy.amount ?? 0),
        farmerName: subsidy.farmer.user.username,
        state:
          subsidy.farmer.farms && subsidy.farmer.farms.length > 0
            ? subsidy.farmer.farms[0].state || 'Unknown'
            : 'Unknown',
        status: subsidy.status,
        createdAt: subsidy.createdAt,
        onChainTxHash: subsidy.onChainTxHash,
      })),
      activePrograms: activeProgramsData.map((program) => ({
        id: program.id,
        name: program.name,
        type: program.type,
        startDate: program.startDate,
        endDate: program.endDate,
        status: program.status,
        payoutAmount: program.payoutRule?.amount
          ? Number(program.payoutRule.amount)
          : null,
      })),
    };
  }
}
