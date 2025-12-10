import { Module } from '@nestjs/common';
import { SubsidyController } from './subsidy.controller';
import { SubsidyService } from './subsidy.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PinataModule } from 'pinata/pinata.module';

@Module({
  imports: [PrismaModule, PinataModule],
  controllers: [SubsidyController],
  providers: [SubsidyService, CloudinaryService],
  exports: [SubsidyService],
})
export class SubsidyModule {}
