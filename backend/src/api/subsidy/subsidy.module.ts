import { Module } from '@nestjs/common';
import { SubsidyController } from './subsidy.controller';
import { SubsidyService } from './subsidy.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PinataModule } from 'pinata/pinata.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, PinataModule, NotificationModule],
  controllers: [SubsidyController],
  providers: [SubsidyService, CloudinaryService],
  exports: [SubsidyService],
})
export class SubsidyModule {}
