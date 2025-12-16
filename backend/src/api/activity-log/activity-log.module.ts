import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogInterceptor } from './interceptors/activity-log.interceptor';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityLogController],
  providers: [
    ActivityLogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}

