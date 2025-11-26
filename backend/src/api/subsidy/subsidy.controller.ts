import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubsidyService } from './subsidy.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestSubsidyDto } from './dto/request-subsidy.dto';
import { SubsidyResponseDto } from './dto/responses/subsidy-response.dto';
import { UpdateOnChainSubsidyDto } from './dto/update-onchain-subsidy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import type { RequestWithUser } from '../auth/types/request-with-user';

@ApiTags('subsidy')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subsidy')
export class SubsidyController {
  constructor(private readonly subsidyService: SubsidyService) {}

  @Post()
  @Roles(Role.FARMER)
  @ApiBody({ type: RequestSubsidyDto })
  @ApiCreatedResponse({ type: SubsidyResponseDto })
  requestSubsidy(
    @Body() dto: RequestSubsidyDto,
    @Req() req: RequestWithUser,
  ): Promise<SubsidyResponseDto> {
    return this.subsidyService.requestSubsidy(req.user.id, dto);
  }

  @Get()
  @Roles(Role.FARMER)
  @ApiOkResponse({ type: [SubsidyResponseDto] })
  listSubsidies(@Req() req: RequestWithUser): Promise<SubsidyResponseDto[]> {
    return this.subsidyService.listSubsidies(req.user.id);
  }

  @Get(':id')
  @Roles(Role.FARMER)
  @ApiOkResponse({ type: SubsidyResponseDto })
  getSubsidy(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<SubsidyResponseDto> {
    return this.subsidyService.getSubsidyById(req.user.id, id);
  }

  @Post(':id/onchain')
  @Roles(Role.ADMIN)
  @ApiBody({ type: UpdateOnChainSubsidyDto })
  @ApiOkResponse({ type: SubsidyResponseDto })
  markOnChain(
    @Param('id') id: string,
    @Body() dto: UpdateOnChainSubsidyDto,
  ): Promise<SubsidyResponseDto> {
    return this.subsidyService.markOnChainClaim(
      id,
      dto.onChainClaimId,
      dto.onChainTxHash,
      dto.status,
    );
  }
}
