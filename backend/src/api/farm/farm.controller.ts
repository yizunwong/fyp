import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  Get,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FarmService } from './farm.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadFarmDocumentsDto } from './dto/upload-farm-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { UpdateFarmStatusDto } from './dto/update-farm-status.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { PendingFarmResponseDto } from './dto/responses/pending-farm.dto';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';

@ApiTags('farm')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post(':id/upload/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.ADMIN)
  @UseInterceptors(FilesInterceptor('documents', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFarmDocumentsDto })
  uploadDocuments(
    @Param('id') farmId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadFarmDocumentsDto,
    @Req() req: RequestWithUser,
  ) {
    return this.farmService.uploadDocuments(
      farmId,
      files,
      body?.types,
      req.user.id,
    );
  }

  @Patch(':id/verification-status')
  @Roles(Role.GOVERNMENT_AGENCY, Role.ADMIN)
  updateVerificationStatus(
    @Param('id') farmId: string,
    @Body() body: UpdateFarmStatusDto,
  ) {
    return this.farmService.setVerificationStatus(
      farmId,
      body.verificationStatus,
    );
  }

  @Get('pending')
  // @Roles(Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(PendingFarmResponseDto, true, 'Pending farms retrieved')
  async listPendingFarms(): Promise<
    CommonResponseDto<PendingFarmResponseDto[]>
  > {
    const farms = await this.farmService.listPendingFarms();
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farms retrieved successfully',
      data: farms,
      count: farms.length,
    });
  }

  @Get('pending/:id')
  @ApiCommonResponse(PendingFarmResponseDto, false, 'Pending farm retrieved')
  async getPendingFarm(
    @Param('id') farmId: string,
  ): Promise<CommonResponseDto<PendingFarmResponseDto>> {
    const farm = await this.farmService.getPendingFarm(farmId);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farm retrieved successfully',
      data: farm,
    });
  }
}
