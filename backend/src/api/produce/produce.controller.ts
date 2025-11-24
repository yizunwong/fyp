import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProduceService } from './produce.service';
import { AssignRetailerDto } from './dto/assign-retailer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { UploadProduceImageDto } from './dto/upload-produce-image.dto';
import { UploadProduceCertificatesDto } from './dto/upload-produce-certificates.dto';

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
      { type: body.type },
      {
        id: req.user.id,
        role: req.user.role,
      },
    );
  }
}
