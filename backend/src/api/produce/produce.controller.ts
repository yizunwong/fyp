import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProduceStatus, Role } from '@prisma/client';
import { ProduceService } from './produce.service';
import { AssignRetailerDto } from './dto/assign-retailer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { UploadProduceImageDto } from './dto/upload-produce-image.dto';
import { UploadProduceCertificatesDto } from './dto/upload-produce-certificates.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { ProduceListResponseDto } from './dto/responses/produce-list.dto';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { CreateProduceReviewDto } from './dto/create-produce-review.dto';
import { ListProduceQueryDto } from './dto/list-produce-query.dto';

@ApiTags('Produce')
@Controller('produce')
export class ProduceController {
  constructor(private readonly produceService: ProduceService) {}

  @Get('batches')
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProduceStatus,
    description: 'Optional status filter for produce batches',
  })
  @ApiCommonResponse(ProduceListResponseDto, true, 'Produce batches retrieved')
  async listAllBatches(
    @Query() query: ListProduceQueryDto,
  ): Promise<CommonResponseDto<ProduceListResponseDto[]>> {
    const batches = await this.produceService.listAllBatches(query.status);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Produce batches retrieved successfully',
      data: batches,
      count: batches.length,
    });
  }

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

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadProduceImageDto })
  uploadProduceImage(
    @Param('id') produceId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return this.produceService.updateProduceImage(produceId, file, {
      id: req.user.id,
      role: req.user.role,
    });
  }

  @Post(':id/upload/certificates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.ADMIN)
  @UseInterceptors(FilesInterceptor('certificates', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadProduceCertificatesDto })
  uploadCertificates(
    @Param('id') produceId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadProduceCertificatesDto,
    @Req() req: RequestWithUser,
  ) {
    return this.produceService.uploadCertificates(
      produceId,
      files,
      body?.types,
      {
        id: req.user.id,
        role: req.user.role,
      },
    );
  }

  @Post(':batchId/arrive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RETAILER)
  markArrival(@Param('batchId') batchId: string, @Req() req: RequestWithUser) {
    return this.produceService.markProduceArrival(batchId, req.user.id);
  }

  @Post(':batchId/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RETAILER)
  createProduceReview(
    @Param('batchId') batchId: string,
    @Body() dto: CreateProduceReviewDto,
    @Req() req: RequestWithUser,
  ) {
    return this.produceService.createProduceReview(
      batchId,
      req.user.id,
      dto.rating,
      dto.comment,
    );
  }
}
