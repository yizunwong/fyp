import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubsidyService } from './subsidy.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestSubsidyDto } from './dto/request-subsidy.dto';
import { SubsidyResponseDto } from './dto/responses/subsidy-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { UploadSubsidyEvidenceDto } from './dto/upload-subsidy-evidence.dto';
import { SubsidyEvidenceResponseDto } from './dto/responses/subsidy-evidence-response.dto';

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

  @Post(':id/evidence')
  @Roles(Role.FARMER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadSubsidyEvidenceDto })
  @ApiCreatedResponse({ type: SubsidyEvidenceResponseDto })
  uploadEvidence(
    @Param('id') subsidyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ): Promise<SubsidyEvidenceResponseDto> {
    return this.subsidyService.uploadEvidence(subsidyId, file, req.user.id);
  }
}
