import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProduceService } from './produce.service';
import { AssignRetailerDto } from './dto/assign-retailer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import type { RequestWithUser } from '../auth/types/request-with-user';

@ApiTags('Produce')
@Controller('produce')
export class ProduceController {
  constructor(private readonly produceService: ProduceService) {}

  @Post(':id/assign-retailer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.ADMIN)
  assignRetailer(
    @Param('id') produceId: string,
    @Body() dto: AssignRetailerDto,
    @Req() req: RequestWithUser,
  ) {
    return this.produceService.assignRetailer(produceId, dto.retailerId, {
      id: req.user.id,
      role: req.user.role,
    });
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.ADMIN)
  archiveProduce(@Param('id') produceId: string, @Req() req: RequestWithUser) {
    return this.produceService.archiveProduce(produceId, {
      id: req.user.id,
      role: req.user.role,
    });
  }
}
