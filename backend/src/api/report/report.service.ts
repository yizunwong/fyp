import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/requests/create-report.dto';
import { CreateReportQueryDto } from './dto/requests/create-report-query.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { Prisma } from 'prisma/generated/prisma/client';
import { ReportStatus, ReportType } from 'prisma/generated/prisma/enums';
import { formatError } from 'src/common/helpers/error';
import { PdfService } from './pdf.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  private buildPagination(params?: ListReportsQueryDto) {
    const defaultLimit = 20;
    const maxLimit = 100;
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit =
      params?.limit && params.limit > 0
        ? Math.min(params.limit, maxLimit)
        : defaultLimit;

    return {
      take: limit,
      skip: (page - 1) * limit,
    };
  }

  private buildWhere(
    userId: string,
    params?: ListReportsQueryDto,
  ): Prisma.ReportWhereInput {
    const where: Prisma.ReportWhereInput = {
      userId,
    };

    if (params?.reportType) {
      where.reportType = params.reportType;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.dateFrom || params?.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) {
        where.createdAt.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.createdAt.lte = new Date(params.dateTo);
      }
    }

    return where;
  }

  async createReport(
    userId: string,
    dto: CreateReportDto,
    query?: CreateReportQueryDto,
  ) {
    try {
      const report = await this.prisma.report.create({
        data: {
          userId,
          reportType: dto.reportType,
          title: dto.title,
          parameters: (query ?? null) as Prisma.InputJsonValue,
          status: ReportStatus.GENERATING,
        },
      });

      // Generate PDF asynchronously
      this.generateReportPdf(
        report.id,
        userId,
        dto.reportType,
        query as Record<string, unknown> | undefined,
      ).catch((error) => {
        this.logger.error(
          `Failed to generate PDF for report ${report.id}: ${formatError(error)}`,
        );
      });

      return report;
    } catch (e) {
      this.logger.error(`createReport error: ${formatError(e)}`);
      throw new BadRequestException('Failed to create report', e as string);
    }
  }

  /**
   * Generate PDF report and update the report record
   */
  private async generateReportPdf(
    reportId: string,
    userId: string,
    reportType: ReportType,
    parameters?: Record<string, unknown>,
  ) {
    try {
      this.logger.log(`Generating PDF for report ${reportId}`);

      // Generate PDF buffer (no external upload)
      await this.pdfService.generatePdf(reportType, userId, parameters);

      // Update report status
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.COMPLETED,
          generatedAt: new Date(),
        },
      });

      this.logger.log(`PDF generated successfully for report ${reportId}`);
    } catch (error) {
      this.logger.error(
        `Error generating PDF for report ${reportId}: ${formatError(error)}`,
      );

      // Update report status to failed
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * Generate a fresh PDF buffer for an existing report
   * (used by the download endpoint; does not persist the file anywhere).
   */
  async generateReportPdfBuffer(reportId: string, userId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, userId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const buffer = await this.pdfService.generatePdf(
      report.reportType,
      userId,
      (report.parameters as Record<string, unknown> | null) ?? undefined,
    );

    return { buffer, report };
  }

  async listReports(userId: string, params?: ListReportsQueryDto) {
    const where = this.buildWhere(userId, params);
    const pagination = this.buildPagination(params);

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        ...pagination,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      total,
      page: params?.page || 1,
      limit: pagination.take,
    };
  }

  async getReportById(reportId: string, userId: string) {
    const report = await this.prisma.report.findFirst({
      where: {
        id: reportId,
        userId,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }
}
