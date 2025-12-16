import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateActivityLogDto } from './dto/requests/create-activity-log.dto';
import { ListActivityLogsQueryDto } from './dto/list-activity-logs-query.dto';
import { Prisma } from 'prisma/generated/prisma/client';
import { formatError } from 'src/common/helpers/error';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  private buildPagination(params?: ListActivityLogsQueryDto) {
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
    params?: ListActivityLogsQueryDto,
  ): Prisma.ActivityLogWhereInput {
    const where: Prisma.ActivityLogWhereInput = {
      userId,
    };

    if (params?.action) {
      where.action = {
        contains: params.action,
        mode: 'insensitive',
      };
    }

    if (params?.entityType) {
      where.entityType = params.entityType;
    }

    if (params?.entityId) {
      where.entityId = params.entityId;
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

  async createActivityLog(userId: string, dto: CreateActivityLogDto) {
    try {
      const activityLog = await this.prisma.activityLog.create({
        data: {
          userId,
          action: dto.action,
          entityType: dto.entityType,
          entityId: dto.entityId,
          details: dto.details as Prisma.InputJsonValue,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
        },
      });

      return activityLog;
    } catch (e) {
      this.logger.error(`createActivityLog error: ${formatError(e)}`);
      throw new BadRequestException('Failed to create activity log', e as string);
    }
  }

  async listActivityLogs(userId: string, params?: ListActivityLogsQueryDto) {
    const where = this.buildWhere(userId, params);
    const pagination = this.buildPagination(params);

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        ...pagination,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page: params?.page || 1,
      limit: pagination.take,
    };
  }

  async getActivityLogById(logId: string, userId: string) {
    const log = await this.prisma.activityLog.findFirst({
      where: {
        id: logId,
        userId,
      },
    });

    if (!log) {
      throw new NotFoundException('Activity log not found');
    }

    return log;
  }
}

