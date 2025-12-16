import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/requests/create-notification.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { Prisma } from 'prisma/generated/prisma/client';
import { formatError } from 'src/common/helpers/error';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  private buildPagination(params?: ListNotificationsQueryDto) {
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
    params?: ListNotificationsQueryDto,
  ): Prisma.NotificationWhereInput {
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (params?.read !== undefined) {
      where.read = params.read;
    }

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.relatedEntityType) {
      where.relatedEntityType = params.relatedEntityType;
    }

    return where;
  }

  async createNotification(dto: CreateNotificationDto) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          relatedEntityType: dto.relatedEntityType,
          relatedEntityId: dto.relatedEntityId,
          metadata: dto.metadata as Prisma.InputJsonValue,
        },
      });

      return notification;
    } catch (e) {
      this.logger.error(`createNotification error: ${formatError(e)}`);
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new BadRequestException('Failed to create notification', e as string);
    }
  }

  async listNotifications(userId: string, params?: ListNotificationsQueryDto) {
    const where = this.buildWhere(userId, params);
    const pagination = this.buildPagination(params);

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        ...pagination,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page: params?.page || 1,
      limit: pagination.take,
    };
  }

  async getNotificationById(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.getNotificationById(notificationId, userId);

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }
}

