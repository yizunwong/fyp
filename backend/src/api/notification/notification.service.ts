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
      throw new BadRequestException(
        'Failed to create notification',
        e as string,
      );
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

  async markAsRead(notificationId: string) {
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

  /**
   * Helper method to create a notification (with error handling)
   */
  async createNotificationSafe(
    dto: CreateNotificationDto,
  ): Promise<Awaited<ReturnType<typeof this.createNotification>> | null> {
    try {
      return await this.createNotification(dto);
    } catch (error) {
      this.logger.error(`Failed to create notification: ${formatError(error)}`);
      // Don't throw - notifications are non-critical
      return null;
    }
  }

  /**
   * Notify agency when someone enrolls in their program
   */
  async notifyAgencyProgramEnrollment(
    agencyId: string,
    farmerName: string,
    programName: string,
    programId: string,
  ) {
    return this.createNotificationSafe({
      userId: agencyId,
      type: 'PROGRAM_ENROLLED',
      title: 'New Program Enrollment',
      message: `${farmerName} has enrolled in your program: ${programName}`,
      relatedEntityType: 'Program',
      relatedEntityId: programId,
      metadata: {
        programName,
        farmerName,
      },
    });
  }

  /**
   * Notify agency when someone submits a subsidy for their program
   */
  async notifyAgencySubsidySubmitted(
    agencyId: string,
    farmerName: string,
    programName: string,
    subsidyId: string,
    amount: number,
  ) {
    return this.createNotificationSafe({
      userId: agencyId,
      type: 'SUBSIDY_SUBMITTED',
      title: 'New Subsidy Submission',
      message: `${farmerName} has submitted a subsidy claim for ${programName} (Amount: ${amount})`,
      relatedEntityType: 'Subsidy',
      relatedEntityId: subsidyId,
      metadata: {
        programName,
        farmerName,
        amount,
      },
    });
  }

  /**
   * Notify farmer when their registration is approved
   */
  async notifyFarmerRegistrationApproved(
    farmerId: string,
    farmName: string,
    farmId: string,
  ) {
    return this.createNotificationSafe({
      userId: farmerId,
      type: 'FARM_VERIFIED',
      title: 'Farm Registration Approved',
      message: `Your farm "${farmName}" has been approved and verified`,
      relatedEntityType: 'Farm',
      relatedEntityId: farmId,
      metadata: {
        farmName,
      },
    });
  }

  /**
   * Notify farmer when their subsidy is approved
   */
  async notifyFarmerSubsidyApproved(
    farmerId: string,
    programName: string,
    subsidyId: string,
    amount: number,
  ) {
    return this.createNotificationSafe({
      userId: farmerId,
      type: 'SUBSIDY_APPROVED',
      title: 'Subsidy Approved',
      message: `Your subsidy claim for ${programName} has been approved (Amount: ${amount})`,
      relatedEntityType: 'Subsidy',
      relatedEntityId: subsidyId,
      metadata: {
        programName,
        amount,
      },
    });
  }

  /**
   * Notify farmer when their subsidy is disbursed
   */
  async notifyFarmerSubsidyDisbursed(
    farmerId: string,
    programName: string,
    subsidyId: string,
    amount: number,
  ) {
    return this.createNotificationSafe({
      userId: farmerId,
      type: 'SUBSIDY_DISBURSED',
      title: 'Subsidy Disbursed',
      message: `Your subsidy for ${programName} has been disbursed (Amount: ${amount})`,
      relatedEntityType: 'Subsidy',
      relatedEntityId: subsidyId,
      metadata: {
        programName,
        amount,
      },
    });
  }

  /**
   * Notify retailer when a batch is assigned to them
   */
  async notifyRetailerBatchAssigned(
    retailerId: string,
    batchId: string,
    produceName: string,
    produceId: string,
  ) {
    return this.createNotificationSafe({
      userId: retailerId,
      type: 'BATCH_ASSIGNED',
      title: 'Batch Assigned to You',
      message: `Batch ${batchId} (${produceName}) has been assigned to you and is in transit`,
      relatedEntityType: 'Produce',
      relatedEntityId: produceId,
      metadata: {
        batchId,
        produceName,
      },
    });
  }

  /**
   * Notify farmer when their batch arrives at retailer
   */
  async notifyFarmerBatchArrived(
    farmerId: string,
    batchId: string,
    produceName: string,
    produceId: string,
  ) {
    return this.createNotificationSafe({
      userId: farmerId,
      type: 'BATCH_ARRIVED',
      title: 'Batch Arrived at Retailer',
      message: `Your batch ${batchId} (${produceName}) has arrived at the retailer`,
      relatedEntityType: 'Produce',
      relatedEntityId: produceId,
      metadata: {
        batchId,
        produceName,
      },
    });
  }

  /**
   * Notify farmer when their batch is verified by retailer
   */
  async notifyFarmerBatchVerified(
    farmerId: string,
    batchId: string,
    produceName: string,
    produceId: string,
  ) {
    return this.createNotificationSafe({
      userId: farmerId,
      type: 'BATCH_VERIFIED',
      title: 'Batch Verified',
      message: `Your batch ${batchId} (${produceName}) has been verified by the retailer`,
      relatedEntityType: 'Produce',
      relatedEntityId: produceId,
      metadata: {
        batchId,
        produceName,
      },
    });
  }
}
