import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/types/request-with-user';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/requests/create-report.dto';
import { CreateReportQueryDto } from './dto/requests/create-report-query.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { ReportResponseDto } from './dto/responses/report-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import type { Response } from 'express';

@ApiTags('Report')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiCommonResponse(ReportResponseDto, false, 'Report created')
  async createReport(
    @Body() dto: CreateReportDto,
    @Query() query: CreateReportQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<ReportResponseDto>> {
    const report = await this.reportService.createReport(
      req.user.id,
      dto,
      query,
    );

    return new CommonResponseDto({
      statusCode: 201,
      message: 'Report created successfully',
      data: report as ReportResponseDto,
    });
  }

  @Get()
  @ApiCommonResponse(ReportResponseDto, true, 'Reports retrieved')
  async listReports(
    @Req() req: RequestWithUser,
    @Query() query: ListReportsQueryDto,
  ): Promise<CommonResponseDto<ReportResponseDto[]>> {
    const result = await this.reportService.listReports(req.user.id, query);

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Reports retrieved successfully',
      data: result.reports as ReportResponseDto[],
      count: result.total,
    });
  }

  @Get(':id')
  @ApiCommonResponse(ReportResponseDto, false, 'Report retrieved')
  async getReport(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<ReportResponseDto>> {
    const report = await this.reportService.getReportById(id, req.user.id);

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Report retrieved successfully',
      data: report as ReportResponseDto,
    });
  }

  @Get(':id/download')
  async downloadReport(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, report } = await this.reportService.generateReportPdfBuffer(
      id,
      req.user.id,
    );

    const safeTitle =
      report.title?.replace(/[^a-zA-Z0-9_.-]/g, '_') ||
      `${report.reportType.toLowerCase()}_report`;
    const filename = `${safeTitle}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
