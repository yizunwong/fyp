import { Module } from '@nestjs/common';
import { SubsidyController } from './subsidy.controller';
import { SubsidyService } from './subsidy.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubsidyController],
  providers: [SubsidyService],
  exports: [SubsidyService],
})
export class SubsidyModule {}
