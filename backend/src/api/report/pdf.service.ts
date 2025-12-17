import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import {
  ReportType,
  SubsidyStatus,
  ProduceStatus,
  ProgramStatus,
  ProgramType,
  Role,
} from 'prisma/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'prisma/generated/prisma/client';

// Type definitions for report data
interface FarmSummaryData {
  farms: Array<{
    name: string;
    address: string;
    size: number;
    sizeUnit: string;
    verificationStatus: string;
    rating: number;
    ratingCount: number;
  }>;
  summary: {
    totalFarms: number;
    totalSize: number;
    totalProduces: number;
  };
}

interface SubsidyReportData {
  subsidies: Array<{
    programs: { name: string; type: string } | null;
    amount: number;
    status: string;
    createdAt: Date;
  }>;
  summary: {
    total: number;
    totalAmount: number;
    approvedAmount: number;
  };
}

interface ProduceReportData {
  produces: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    farm: { name: string; address: string } | null;
    harvestDate: Date;
    status: string;
  }>;
  summary: {
    total: number;
    totalQuantity: number;
  };
}

interface ProgramReportData {
  programs: Array<{
    name: string;
    type: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
  summary: {
    total: number;
    totalEnrollments?: number;
    totalSubsidies?: number;
  };
}

interface FinancialReportData {
  subsidies: Array<{
    programs: { name: string } | null;
    amount: number;
    status: string;
    createdAt: Date;
    paidAt: Date | null;
  }>;
  summary: {
    totalReceived: number;
    totalPending: number;
    total: number;
  };
}

interface ActivityReportData {
  activities: Array<{
    action: string;
    entityType: string | null;
    createdAt: Date;
    ipAddress: string | null;
  }>;
  summary: {
    total: number;
  };
}

type ReportData =
  | FarmSummaryData
  | SubsidyReportData
  | ProduceReportData
  | ProgramReportData
  | FinancialReportData
  | ActivityReportData
  | { message: string };

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate PDF report based on report type
   */
  async generatePdf(
    reportType: ReportType,
    userId: string,
    parameters?: Record<string, unknown>,
  ): Promise<Buffer> {
    const html = await this.generateHtml(reportType, userId, parameters);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate HTML content for the report based on type
   */
  private async generateHtml(
    reportType: ReportType,
    userId: string,
    parameters?: Record<string, unknown>,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const role = user?.role ?? Role.FARMER;
    const isAdmin = role === Role.ADMIN;

    console.log('role', role);

    let data: ReportData = { message: 'No data' };
    let title = '';

    switch (reportType) {
      case ReportType.FARM_SUMMARY:
        data = await this.getFarmSummaryData(userId, parameters, isAdmin);
        title = 'Farm Summary Report';
        break;
      case ReportType.SUBSIDY_REPORT:
        data = await this.getSubsidyReportData(userId, parameters, isAdmin);
        title = 'Subsidy Report';
        break;
      case ReportType.PRODUCE_REPORT:
        data = await this.getProduceReportData(userId, parameters, isAdmin);
        title = 'Produce Report';
        break;
      case ReportType.PROGRAM_REPORT:
        data = await this.getProgramReportData(userId, parameters, isAdmin);
        title = 'Program Report';
        break;
      case ReportType.FINANCIAL_REPORT:
        data = await this.getFinancialReportData(userId, parameters, isAdmin);
        title = 'Financial Report';
        break;
      case ReportType.ACTIVITY_REPORT:
        data = await this.getActivityReportData(userId, parameters, isAdmin);
        title = 'Activity Report';
        break;
      default:
        data = { message: 'Report type not supported' };
        title = 'Custom Report';
    }

    return this.buildHtmlTemplate(title, data, reportType);
  }

  /**
   * Get farm summary data
   */
  private async getFarmSummaryData(
    userId: string,
    parameters: Record<string, unknown> | undefined,
    isAdmin: boolean,
  ): Promise<FarmSummaryData> {
    const where: Prisma.FarmWhereInput = {
      ...(isAdmin ? {} : { farmerId: userId }),
    };

    if (parameters?.farmId) {
      where.id = parameters.farmId as string;
    }

    if (parameters?.state) {
      where.state = parameters.state as string;
    }

    if (parameters?.district) {
      where.district = parameters.district as string;
    }

    if (parameters?.farmVerificationStatus) {
      // Stored as enum in Prisma; value comes from DTO typed as FarmVerificationStatus
      where.verificationStatus =
        parameters.farmVerificationStatus as Prisma.FarmWhereInput['verificationStatus'];
    }

    if (parameters?.minFarmSize || parameters?.maxFarmSize) {
      const sizeFilter: Prisma.FloatFilter = {};

      if (parameters.minFarmSize) {
        const min = Number(parameters.minFarmSize as string);
        if (!Number.isNaN(min)) {
          sizeFilter.gte = min;
        }
      }

      if (parameters.maxFarmSize) {
        const max = Number(parameters.maxFarmSize as string);
        if (!Number.isNaN(max)) {
          sizeFilter.lte = max;
        }
      }

      if (Object.keys(sizeFilter).length > 0) {
        where.size = sizeFilter;
      }
    }

    const farms = await this.prisma.farm.findMany({
      where,
      include: {
        produces: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        farmer: {
          include: {
            user: {
              select: {
                email: true,
                username: true,
                nric: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const totalFarms = farms.length;
    const totalSize = farms.reduce((sum, farm) => sum + farm.size, 0);
    const totalProduces = farms.reduce(
      (sum, farm) => sum + farm.produces.length,
      0,
    );

    return {
      farms: farms.map((farm) => ({
        name: farm.name,
        address: farm.address,
        size: farm.size,
        sizeUnit: farm.sizeUnit,
        verificationStatus: farm.verificationStatus,
        rating: farm.rating,
        ratingCount: farm.ratingCount,
      })),
      summary: {
        totalFarms,
        totalSize,
        totalProduces,
      },
    };
  }

  /**
   * Get subsidy report data
   */
  private async getSubsidyReportData(
    userId: string,
    parameters: Record<string, unknown> | undefined,
    isAdmin: boolean,
  ): Promise<SubsidyReportData> {
    const where: Prisma.SubsidyWhereInput = {
      ...(isAdmin ? {} : { farmerId: userId }),
    };

    if (parameters?.dateFrom || parameters?.dateTo) {
      where.createdAt = {};
      if (parameters.dateFrom) {
        where.createdAt.gte = new Date(parameters.dateFrom as string);
      }
      if (parameters.dateTo) {
        where.createdAt.lte = new Date(parameters.dateTo as string);
      }
    }

    if (parameters?.status) {
      where.status = parameters.status as SubsidyStatus;
    }

    const subsidies = await this.prisma.subsidy.findMany({
      where,
      include: {
        programs: {
          select: {
            name: true,
            type: true,
          },
        },
        farmer: {
          include: {
            user: {
              select: {
                email: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Amounts are stored in ETH on-chain; convert to RM using provided rate (if any)
    let ethToMyr = 1;
    if (parameters?.ethToMyr !== undefined) {
      const parsed = Number(parameters.ethToMyr as string);
      if (!Number.isNaN(parsed) && parsed > 0) {
        ethToMyr = parsed;
      }
    }

    const convertToRm = (amountEth: number) => amountEth * ethToMyr;

    const totalAmountEth = subsidies.reduce((sum, s) => sum + s.amount, 0);
    const approvedAmountEth = subsidies
      .filter((s) => s.status === 'APPROVED' || s.status === 'DISBURSED')
      .reduce((sum, s) => sum + s.amount, 0);

    const totalAmount = convertToRm(totalAmountEth);
    const approvedAmount = convertToRm(approvedAmountEth);

    return {
      subsidies: subsidies.map((s) => ({
        programs: s.programs
          ? { name: s.programs.name, type: s.programs.type }
          : null,
        amount: convertToRm(s.amount),
        status: s.status,
        createdAt: s.createdAt,
      })),
      summary: {
        total: subsidies.length,
        totalAmount,
        approvedAmount,
      },
    };
  }

  /**
   * Get produce report data
   */
  private async getProduceReportData(
    userId: string,
    parameters: Record<string, unknown> | undefined,
    isAdmin: boolean,
  ): Promise<ProduceReportData> {
    const where: Prisma.ProduceWhereInput = {};

    if (!isAdmin) {
      const farmer = await this.prisma.farmer.findUnique({
        where: { id: userId },
        include: {
          farms: true,
        },
      });

      if (!farmer) {
        return { produces: [], summary: { total: 0, totalQuantity: 0 } };
      }

      const farmIds = farmer.farms.map((f) => f.id);
      where.farmId = { in: farmIds };
    }

    if (parameters?.dateFrom || parameters?.dateTo) {
      where.harvestDate = {};
      if (parameters.dateFrom) {
        where.harvestDate.gte = new Date(parameters.dateFrom as string);
      }
      if (parameters.dateTo) {
        where.harvestDate.lte = new Date(parameters.dateTo as string);
      }
    }

    if (parameters?.status) {
      where.status = parameters.status as ProduceStatus;
    }

    const produces = await this.prisma.produce.findMany({
      where,
      include: {
        farm: {
          select: {
            name: true,
            address: true,
          },
        },
        certifications: true,
      },
      orderBy: { harvestDate: 'desc' },
    });

    const totalQuantity = produces.reduce((sum, p) => sum + p.quantity, 0);

    return {
      produces: produces.map((p) => ({
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        unit: p.unit,
        farm: p.farm ? { name: p.farm.name, address: p.farm.address } : null,
        harvestDate: p.harvestDate,
        status: p.status,
      })),
      summary: {
        total: produces.length,
        totalQuantity,
      },
    };
  }

  /**
   * Get program report data
   */
  private async getProgramReportData(
    userId: string,
    parameters: Record<string, unknown> | undefined,
    isAdmin: boolean,
  ): Promise<ProgramReportData> {
    // For system admin: aggregate across all programs
    if (isAdmin) {
      const where: Prisma.ProgramWhereInput = {};

      if (parameters?.status) {
        where.status = parameters.status as ProgramStatus;
      }

      if (parameters?.programType) {
        where.type = parameters.programType as ProgramType;
      }

      if (parameters?.dateFrom || parameters?.dateTo) {
        where.startDate = {};
        if (parameters.dateFrom) {
          where.startDate.gte = new Date(parameters.dateFrom as string);
        }
        if (parameters.dateTo) {
          where.startDate.lte = new Date(parameters.dateTo as string);
        }
      }

      const programs = await this.prisma.program.findMany({
        where,
        include: {
          farmerPrograms: true,
          subsidies: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalEnrollments = programs.reduce(
        (sum, p) => sum + p.farmerPrograms.length,
        0,
      );
      const totalSubsidies = programs.reduce(
        (sum, p) => sum + p.subsidies.length,
        0,
      );

      return {
        programs: programs.map((p) => ({
          name: p.name,
          type: p.type,
          startDate: p.startDate,
          endDate: p.endDate,
          status: p.status,
        })),
        summary: {
          total: programs.length,
          totalEnrollments,
          totalSubsidies,
        },
      };
    }

    // Non-admin flow: check if user is an agency or farmer
    const agency = await this.prisma.agency.findUnique({
      where: { id: userId },
    });

    if (agency) {
      const where: Prisma.ProgramWhereInput = {
        createdBy: userId,
      };

      if (parameters?.status) {
        where.status = parameters.status as ProgramStatus;
      }

      if (parameters?.programType) {
        where.type = parameters.programType as ProgramType;
      }

      if (parameters?.dateFrom || parameters?.dateTo) {
        where.startDate = {};
        if (parameters.dateFrom) {
          where.startDate.gte = new Date(parameters.dateFrom as string);
        }
        if (parameters.dateTo) {
          where.startDate.lte = new Date(parameters.dateTo as string);
        }
      }

      const programs = await this.prisma.program.findMany({
        where,
        include: {
          farmerPrograms: {
            include: {
              farmer: {
                include: {
                  user: {
                    select: {
                      email: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
          subsidies: {
            select: {
              amount: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalEnrollments = programs.reduce(
        (sum, p) => sum + p.farmerPrograms.length,
        0,
      );
      const totalSubsidies = programs.reduce(
        (sum, p) => sum + p.subsidies.length,
        0,
      );

      return {
        programs: programs.map((p) => ({
          name: p.name,
          type: p.type,
          startDate: p.startDate,
          endDate: p.endDate,
          status: p.status,
        })),
        summary: {
          total: programs.length,
          totalEnrollments,
          totalSubsidies,
        },
      };
    }

    // For farmers, get enrolled programs
    const farmerProgramWhere: Prisma.FarmerProgramWhereInput = {
      farmerId: userId,
    };

    const programFilter: Prisma.ProgramWhereInput = {};

    if (parameters?.status) {
      programFilter.status = parameters.status as ProgramStatus;
    }

    if (parameters?.programType) {
      programFilter.type = parameters.programType as ProgramType;
    }

    if (parameters?.dateFrom || parameters?.dateTo) {
      programFilter.startDate = {};
      if (parameters.dateFrom) {
        programFilter.startDate.gte = new Date(parameters.dateFrom as string);
      }
      if (parameters.dateTo) {
        programFilter.startDate.lte = new Date(parameters.dateTo as string);
      }
    }

    if (Object.keys(programFilter).length > 0) {
      farmerProgramWhere.programs = { is: programFilter };
    }

    const farmerPrograms = await this.prisma.farmerProgram.findMany({
      where: farmerProgramWhere,
      include: {
        programs: {
          include: {
            createdByAgency: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return {
      programs: farmerPrograms.map((fp) => ({
        name: fp.programs.name,
        type: fp.programs.type,
        startDate: fp.programs.startDate,
        endDate: fp.programs.endDate,
        status: fp.programs.status,
      })),
      summary: {
        total: farmerPrograms.length,
      },
    };
  }

  /**
   * Get financial report data
   */
  private async getFinancialReportData(
    userId: string,
    parameters: Record<string, unknown> | undefined,
    isAdmin: boolean,
  ): Promise<FinancialReportData> {
    const where: Prisma.SubsidyWhereInput = {
      ...(isAdmin ? {} : { farmerId: userId }),
    };

    if (parameters?.dateFrom || parameters?.dateTo) {
      where.createdAt = {};
      if (parameters.dateFrom) {
        where.createdAt.gte = new Date(parameters.dateFrom as string);
      }
      if (parameters.dateTo) {
        where.createdAt.lte = new Date(parameters.dateTo as string);
      }
    }

    const subsidies = await this.prisma.subsidy.findMany({
      where,
      select: {
        amount: true,
        status: true,
        createdAt: true,
        paidAt: true,
        programs: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReceived = subsidies
      .filter((s) => s.status === 'DISBURSED')
      .reduce((sum, s) => sum + s.amount, 0);
    const totalPending = subsidies
      .filter((s) => s.status === 'APPROVED')
      .reduce((sum, s) => sum + s.amount, 0);

    return {
      subsidies: subsidies.map((s) => ({
        programs: s.programs ? { name: s.programs.name } : null,
        amount: s.amount,
        status: s.status,
        createdAt: s.createdAt,
        paidAt: s.paidAt,
      })),
      summary: {
        totalReceived,
        totalPending,
        total: subsidies.length,
      },
    };
  }

  /**
   * Get activity report data
   */
  private async getActivityReportData(
    userId: string,
    parameters: Record<string, unknown> | undefined,
    isAdmin: boolean,
  ): Promise<ActivityReportData> {
    const where: Prisma.ActivityLogWhereInput = isAdmin ? {} : { userId };

    if (parameters?.dateFrom || parameters?.dateTo) {
      where.createdAt = {};
      if (parameters.dateFrom) {
        where.createdAt.gte = new Date(parameters.dateFrom as string);
      }
      if (parameters.dateTo) {
        where.createdAt.lte = new Date(parameters.dateTo as string);
      }
    }

    if (parameters?.action) {
      where.action = parameters.action as string;
    }

    const activities = await this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      activities,
      summary: {
        total: activities.length,
      },
    };
  }

  /**
   * Build HTML template for the PDF
   */
  private buildHtmlTemplate(
    title: string,
    data: ReportData,
    reportType: ReportType,
  ): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let content = '';

    switch (reportType) {
      case ReportType.FARM_SUMMARY:
        content = this.buildFarmSummaryContent(data as FarmSummaryData);
        break;
      case ReportType.SUBSIDY_REPORT:
        content = this.buildSubsidyReportContent(data as SubsidyReportData);
        break;
      case ReportType.PRODUCE_REPORT:
        content = this.buildProduceReportContent(data as ProduceReportData);
        break;
      case ReportType.PROGRAM_REPORT:
        content = this.buildProgramReportContent(data as ProgramReportData);
        break;
      case ReportType.FINANCIAL_REPORT:
        content = this.buildFinancialReportContent(data as FinancialReportData);
        break;
      case ReportType.ACTIVITY_REPORT:
        content = this.buildActivityReportContent(data as ActivityReportData);
        break;
      default:
        content = `<p>${JSON.stringify(data, null, 2)}</p>`;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            padding: 20px;
          }
          .header {
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 5px;
          }
          .header .date {
            color: #7f8c8d;
            font-size: 11px;
          }
          .summary {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .summary h2 {
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          }
          .summary-item {
            background: white;
            padding: 10px;
            border-radius: 3px;
          }
          .summary-item-label {
            font-size: 10px;
            color: #7f8c8d;
            text-transform: uppercase;
          }
          .summary-item-value {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
          }
          th {
            background: #34495e;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background: #f8f9fa;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #7f8c8d;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="date">Generated on: ${currentDate}</div>
        </div>
        ${content}
        <div class="footer">
          <p>This is an auto-generated report. For questions, please contact support.</p>
        </div>
      </body>
      </html>
    `;
  }

  private buildFarmSummaryContent(data: FarmSummaryData): string {
    const { farms, summary } = data;
    return `
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-item-label">Total Farms</div>
            <div class="summary-item-value">${summary.totalFarms}</div>
          </div>
          <div class="summary-item">
            <div class="summary-item-label">Total Size</div>
            <div class="summary-item-value">${summary.totalSize.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-item-label">Total Produces</div>
            <div class="summary-item-value">${summary.totalProduces}</div>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Farm Name</th>
            <th>Address</th>
            <th>Size</th>
            <th>Status</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          ${farms
            .map(
              (farm) => `
            <tr>
              <td>${farm.name}</td>
              <td>${farm.address || 'N/A'}</td>
              <td>${farm.size} ${farm.sizeUnit}</td>
              <td>${farm.verificationStatus}</td>
              <td>${farm.rating.toFixed(1)} (${farm.ratingCount} reviews)</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private buildSubsidyReportContent(data: SubsidyReportData): string {
    const { subsidies, summary } = data;
    return `
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-item-label">Total Subsidies</div>
            <div class="summary-item-value">${summary.total}</div>
          </div>
          <div class="summary-item">
            <div class="summary-item-label">Total Amount</div>
            <div class="summary-item-value">RM ${summary.totalAmount.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-item-label">Approved Amount</div>
            <div class="summary-item-value">RM ${summary.approvedAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Program</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${subsidies
            .map(
              (subsidy) => `
            <tr>
              <td>${subsidy.programs?.name || 'N/A'}</td>
              <td>RM ${subsidy.amount.toFixed(2)}</td>
              <td>${subsidy.status}</td>
              <td>${new Date(subsidy.createdAt).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private buildProduceReportContent(data: ProduceReportData): string {
    const { produces, summary } = data;
    return `
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-item-label">Total Produces</div>
            <div class="summary-item-value">${summary.total}</div>
          </div>
          <div class="summary-item">
            <div class="summary-item-label">Total Quantity</div>
            <div class="summary-item-value">${summary.totalQuantity.toFixed(2)}</div>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Farm</th>
            <th>Harvest Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${produces
            .map(
              (produce) => `
            <tr>
              <td>${produce.name}</td>
              <td>${produce.category}</td>
              <td>${produce.quantity} ${produce.unit}</td>
              <td>${produce.farm?.name || 'N/A'}</td>
              <td>${new Date(produce.harvestDate).toLocaleDateString()}</td>
              <td>${produce.status}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private buildProgramReportContent(data: ProgramReportData): string {
    const { programs, summary } = data;
    return `
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-item-label">Total Programs</div>
            <div class="summary-item-value">${summary.total}</div>
          </div>
          ${
            summary.totalEnrollments !== undefined
              ? `
          <div class="summary-item">
            <div class="summary-item-label">Total Enrollments</div>
            <div class="summary-item-value">${summary.totalEnrollments}</div>
          </div>
          `
              : ''
          }
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Program Name</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${programs
            .map(
              (program) => `
            <tr>
              <td>${program.name}</td>
              <td>${program.type}</td>
              <td>${new Date(program.startDate).toLocaleDateString()}</td>
              <td>${new Date(program.endDate).toLocaleDateString()}</td>
              <td>${program.status}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private buildFinancialReportContent(data: FinancialReportData): string {
    const { subsidies, summary } = data;
    return `
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-item-label">Total Received</div>
            <div class="summary-item-value">RM ${summary.totalReceived.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-item-label">Pending</div>
            <div class="summary-item-value">RM ${summary.totalPending.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-item-label">Total Subsidies</div>
            <div class="summary-item-value">${summary.total}</div>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Program</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Paid Date</th>
          </tr>
        </thead>
        <tbody>
          ${subsidies
            .map(
              (subsidy) => `
            <tr>
              <td>${subsidy.programs?.name || 'N/A'}</td>
              <td>RM ${subsidy.amount.toFixed(2)}</td>
              <td>${subsidy.status}</td>
              <td>${new Date(subsidy.createdAt).toLocaleDateString()}</td>
              <td>${subsidy.paidAt ? new Date(subsidy.paidAt).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private buildActivityReportContent(data: ActivityReportData): string {
    const { activities, summary } = data;
    return `
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-item-label">Total Activities</div>
            <div class="summary-item-value">${summary.total}</div>
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Entity Type</th>
            <th>Date</th>
            <th>IP Address</th>
          </tr>
        </thead>
        <tbody>
          ${activities
            .map(
              (activity) => `
            <tr>
              <td>${activity.action}</td>
              <td>${activity.entityType || 'N/A'}</td>
              <td>${new Date(activity.createdAt).toLocaleString()}</td>
              <td>${activity.ipAddress || 'N/A'}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }
}
