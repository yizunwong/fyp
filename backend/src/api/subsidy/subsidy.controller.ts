import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubsidyService } from './subsidy.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RequestSubsidyDto } from './dto/request-subsidy.dto';
import { SubsidyResponseDto } from './dto/responses/subsidy-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { UploadSubsidyEvidenceDto } from './dto/upload-subsidy-evidence.dto';
import { SubsidyEvidenceResponseDto } from './dto/responses/subsidy-evidence-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { ListSubsidiesQueryDto } from './dto/list-subsidies-query.dto';

@ApiTags('subsidy')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subsidy')
export class SubsidyController {
  constructor(private readonly subsidyService: SubsidyService) {}

  @Post()
  @Roles(Role.FARMER)
  @ApiBody({ type: RequestSubsidyDto })
  @ApiCommonResponse(
    SubsidyResponseDto,
    false,
    'Subsidy requested successfully',
  )
  async requestSubsidy(
    @Body() dto: RequestSubsidyDto,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<SubsidyResponseDto>> {
    const subsidy = await this.subsidyService.requestSubsidy(req.user.id, dto);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Subsidy requested successfully',
      data: subsidy,
    });
  }

  @Get()
  @Roles(Role.FARMER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(
    SubsidyResponseDto,
    true,
    'Subsidies retrieved successfully',
  )
  async listSubsidies(
    @Req() req: RequestWithUser,
    @Query() query?: ListSubsidiesQueryDto,
  ): Promise<CommonResponseDto<SubsidyResponseDto[]>> {
    if (req.user.role === Role.FARMER) {
      const { data, total } = await this.subsidyService.listSubsidies(
        req.user.id,
        query,
      );
      return new CommonResponseDto({
        statusCode: 200,
        message: 'Subsidies retrieved successfully',
        data,
        count: total,
      });
    } else {
      const { data, total } = await this.subsidyService.listAllSubsidies(
        req.user.id,
        query,
      );
      return new CommonResponseDto({
        statusCode: 200,
        message: 'Subsidies retrieved successfully',
        data,
        count: total,
      });
    }
  }

  @Get(':id')
  @Roles(Role.FARMER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(
    SubsidyResponseDto,
    false,
    'Subsidy retrieved successfully',
  )
  async getSubsidy(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<SubsidyResponseDto>> {
    const subsidy =
      req.user.role === Role.FARMER
        ? await this.subsidyService.getSubsidyById(req.user.id, id)
        : await this.subsidyService.getSubsidyByIdForAgency(id);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Subsidy retrieved successfully',
      data: subsidy,
    });
  }

  @Post(':id/evidence')
  @Roles(Role.FARMER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadSubsidyEvidenceDto })
  @ApiCommonResponse(
    SubsidyEvidenceResponseDto,
    true,
    'Evidence uploaded successfully',
  )
  async uploadEvidence(
    @Param('id') subsidyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<SubsidyEvidenceResponseDto>> {
    const evidence = await this.subsidyService.uploadEvidence(
      subsidyId,
      file,
      req.user.id,
    );
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Evidence uploaded successfully',
      data: evidence,
    });
  }

  @Patch(':id/approve')
  // @Roles(Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(SubsidyResponseDto, false, 'Subsidy approved successfully')
  async approveSubsidy(
    @Param('id') subsidyId: string,
  ): Promise<CommonResponseDto<SubsidyResponseDto>> {
    const subsidy = await this.subsidyService.approveSubsidy(subsidyId);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Subsidy approved successfully',
      data: subsidy,
    });
  }

  @Patch(':id/disburse')
  // @Roles(Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(
    SubsidyResponseDto,
    false,
    'Subsidy disbursed successfully',
  )
  async disburseSubsidy(
    @Param('id') subsidyId: string,
  ): Promise<CommonResponseDto<SubsidyResponseDto>> {
    const subsidy = await this.subsidyService.disburseSubsidy(subsidyId);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Subsidy disbursed successfully',
      data: subsidy,
    });
  }
}
