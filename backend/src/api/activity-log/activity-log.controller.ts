import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RequestWithUser } from '../auth/types/request-with-user';
import { ActivityLogService } from './activity-log.service';
import { ListActivityLogsQueryDto } from './dto/list-activity-logs-query.dto';
import { ActivityLogResponseDto } from './dto/responses/activity-log-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { Role } from 'prisma/generated/prisma/client';

@ApiTags('Activity Log')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @Roles(Role.FARMER, Role.RETAILER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(ActivityLogResponseDto, true, 'Activity logs retrieved')
  async listActivityLogs(
    @Req() req: RequestWithUser,
    @Query() query: ListActivityLogsQueryDto,
  ): Promise<CommonResponseDto<ActivityLogResponseDto[]>> {
    const result = await this.activityLogService.listActivityLogs(
      req.user.id,
      query,
    );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Activity logs retrieved successfully',
      data: result.logs as ActivityLogResponseDto[],
      count: result.total,
    });
  }

  @Get(':id')
  @Roles(Role.FARMER, Role.RETAILER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(ActivityLogResponseDto, false, 'Activity log retrieved')
  async getActivityLog(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<ActivityLogResponseDto>> {
    const activityLog = await this.activityLogService.getActivityLogById(
      id,
      req.user.id,
    );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Activity log retrieved successfully',
      data: activityLog as ActivityLogResponseDto,
    });
  }
}
