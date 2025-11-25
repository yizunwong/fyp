import {
  Body,
  Controller,
  Param,
  Post,
  Req,
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
}
