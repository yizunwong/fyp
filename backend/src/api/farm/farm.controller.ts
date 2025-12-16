import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  Get,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseEnumPipe,
} from '@nestjs/common';
import { FarmService } from './farm.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadFarmDocumentsDto } from './dto/upload-farm-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { UpdateFarmStatusDto } from './dto/update-farm-status.dto';
import { UpdateLandDocumentStatusDto } from './dto/update-land-document-status.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { LandDocumentVerificationStatus } from 'prisma/generated/prisma/enums';
import { PendingFarmResponseDto } from './dto/responses/pending-farm.dto';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { ProduceService } from '../produce/produce.service';
import { FarmReviewListResponseDto } from '../produce/dto/responses/farm-review.response.dto';
import { ListFarmQueryDto } from './dto/list-farm-query.dto';

@ApiTags('farm')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('farm')
export class FarmController {
  constructor(
    private readonly farmService: FarmService,
    private readonly produceService: ProduceService,
  ) {}

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
  // @Roles(Role.GOVERNMENT_AGENCY, Role.ADMIN)
  updateVerificationStatus(
    @Param('id') farmId: string,
    @Body() body: UpdateFarmStatusDto,
  ) {
    return this.farmService.setVerificationStatus(
      farmId,
      body.verificationStatus,
    );
  }

  @Patch('documents/:documentId/:status')
  // @Roles(Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiParam({
    name: 'status',
    enum: LandDocumentVerificationStatus,
    description: 'Verification status for the land document',
  })
  @ApiCommonResponse(
    UpdateLandDocumentStatusDto,
    false,
    'Land document verification status updated',
  )
  async updateLandDocumentVerificationStatus(
    @Param('documentId') documentId: string,
    @Param(
      'status',
      new ParseEnumPipe(LandDocumentVerificationStatus, {
        errorHttpStatusCode: 400,
      }),
    )
    status: LandDocumentVerificationStatus,
    @Body() body: UpdateLandDocumentStatusDto,
    @Req() req: RequestWithUser,
  ) {
    const document =
      await this.farmService.updateLandDocumentVerificationStatus(
        documentId,
        status,
        req.user.id,
        body.rejectionReason,
      );

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Land document verification status updated successfully',
      data: document,
    });
  }

  @Get('pending')
  // @Roles(Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(PendingFarmResponseDto, true, 'Pending farms retrieved')
  async listPendingFarms(
    @Query() query: ListFarmQueryDto,
  ): Promise<CommonResponseDto<PendingFarmResponseDto[]>> {
    const farms = await this.farmService.listPendingFarms(query);
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

  @Get(':farmId/reviews')
  @ApiCommonResponse(FarmReviewListResponseDto, false, 'Farm reviews retrieved')
  async listFarmReviews(
    @Param('farmId') farmId: string,
    @Query('userId') userId?: string,
  ): Promise<CommonResponseDto<FarmReviewListResponseDto>> {
    const { reviews, summary } = await this.produceService.listFarmReviews(
      farmId,
      userId,
    );

    const response = new FarmReviewListResponseDto();
    response.reviews = reviews.map((review) => ({
      id: review.id,
      farmId: review.farmId,
      produceId: review.produceId,
      retailerId: review.retailerId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      batchId: review.produce.batchId,
      produceName: review.produce.name,
      retailerName: review.retailer?.user?.username ?? null,
    }));
    response.summary = summary;

    return new CommonResponseDto({
      statusCode: 200,
      message: 'Farm reviews retrieved successfully',
      data: response,
    });
  }
}
