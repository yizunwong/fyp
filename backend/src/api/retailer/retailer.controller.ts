import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProduceService } from '../produce/produce.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import type { RequestWithUser } from '../auth/types/request-with-user';

@ApiTags('Retailer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('retailer')
export class RetailerController {
  constructor(private readonly produceService: ProduceService) {}

  @Post('verify/:batchId')
  @Roles(Role.RETAILER)
  verifyBatch(@Param('batchId') batchId: string, @Req() req: RequestWithUser) {
    return this.produceService.retailerVerifyProduce(batchId, {
      id: req.user.id,
      role: req.user.role,
    });
  }
}
