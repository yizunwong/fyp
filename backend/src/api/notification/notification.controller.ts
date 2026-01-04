import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/types/request-with-user';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/requests/create-notification.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { NotificationResponseDto } from './dto/responses/notification-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';

@ApiTags('Notification')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiCommonResponse(NotificationResponseDto, false, 'Notification created')
  async createNotification(
    @Body() dto: CreateNotificationDto,
  ): Promise<CommonResponseDto<NotificationResponseDto>> {
    const notification = await this.notificationService.createNotification(dto);
    return new CommonResponseDto({
      statusCode: 201,
      message: 'Notification created successfully',
      data: notification as NotificationResponseDto,
    });
  }

  @Get()
  @ApiCommonResponse(NotificationResponseDto, true, 'Notifications retrieved')
  async listNotifications(
    @Req() req: RequestWithUser,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<CommonResponseDto<NotificationResponseDto[]>> {
    const result = await this.notificationService.listNotifications(
      req.user.id,
      query,
    );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data: result.notifications as NotificationResponseDto[],
      count: result.total,
    });
  }

  @Get(':id')
  @ApiCommonResponse(NotificationResponseDto, false, 'Notification retrieved')
  async getNotification(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<NotificationResponseDto>> {
    const notification = await this.notificationService.getNotificationById(
      id,
      req.user.id,
    );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Notification retrieved successfully',
      data: notification as NotificationResponseDto,
    });
  }

  @Patch(':id/read')
  @ApiCommonResponse(
    NotificationResponseDto,
    false,
    'Notification marked as read',
  )
  async markAsRead(
    @Param('id') id: string,
  ): Promise<CommonResponseDto<NotificationResponseDto>> {
    const notification = await this.notificationService.markAsRead(id);

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Notification marked as read',
      data: notification,
    });
  }

  @Patch('read-all')
  @ApiCommonResponse(Number, false, 'All notifications marked as read')
  async markAllAsRead(
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<{ count: number }>> {
    await this.notificationService.markAllAsRead(req.user.id);

    return new CommonResponseDto({
      statusCode: 200,
      message: 'All notifications marked as read',
      data: { count: 0 },
    });
  }
}
