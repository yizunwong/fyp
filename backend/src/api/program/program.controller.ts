import {
  Body,
  Controller,
  Get,
  Query,
  Patch,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { ProgramResponseDto } from './dto/responses/program-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import type { RequestWithUser } from '../auth/types/request-with-user';
import { UpdateProgramStatusDto } from './dto/update-program-status.dto';
import { ListProgramsQueryDto } from './dto/list-programs-query.dto';
import { ListFarmerProgramsQueryDto } from './dto/list-farmer-programs-query.dto';

@ApiTags('programs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('programs')
export class ProgramController {
  constructor(private readonly programsService: ProgramService) {}

  @Patch(':id/status')
  @Roles(Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiCommonResponse(ProgramResponseDto, false, 'Program status updated')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProgramStatusDto,
  ): Promise<CommonResponseDto<ProgramResponseDto>> {
    const programs = await this.programsService.updateProgramStatus(
      id,
      dto.status,
      dto.onchainId,
    );
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Program status updated',
      data: programs,
    });
  }

  @Post()
  @ApiCommonResponse(ProgramResponseDto, false, 'Program created successfully')
  async createProgram(
    @Body() dto: CreateProgramDto,
  ): Promise<CommonResponseDto<ProgramResponseDto>> {
    const programs = await this.programsService.createProgram(dto);
    return new CommonResponseDto({
      statusCode: 201,
      message: 'Program created successfully',
      data: programs,
    });
  }

  @Get()
  @ApiCommonResponse(
    ProgramResponseDto,
    true,
    'Programs retrieved successfully',
  )
  async getPrograms(
    @Query() query: ListProgramsQueryDto,
  ): Promise<CommonResponseDto<ProgramResponseDto[]>> {
    const { data, total } = await this.programsService.listPrograms(query);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Programs retrieved successfully',
      data,
      count: total,
    });
  }

  @Get('enrolled/me')
  @Roles(Role.FARMER)
  @ApiCommonResponse(
    ProgramResponseDto,
    true,
    'Enrolled programs retrieved successfully',
  )
  async getFarmerPrograms(
    @Req() req: RequestWithUser,
    @Query() query: ListFarmerProgramsQueryDto,
  ): Promise<CommonResponseDto<ProgramResponseDto[]>> {
    const { data, total } = await this.programsService.listFarmerPrograms(
      req.user.id,
      query,
    );
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Enrolled programs retrieved successfully',
      data,
      count: total,
    });
  }

  @Get(':id')
  @ApiCommonResponse(
    ProgramResponseDto,
    false,
    'Program retrieved successfully',
  )
  async getProgram(
    @Param('id') id: string,
  ): Promise<CommonResponseDto<ProgramResponseDto>> {
    const programs = await this.programsService.getProgramById(id);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Program retrieved successfully',
      data: programs,
    });
  }

  @Post(':id/enroll')
  @Roles(Role.FARMER)
  async enrollInProgram(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<null>> {
    await this.programsService.enrollFarmerInProgram(req.user.id, id);
    return new CommonResponseDto({
      statusCode: 201,
      message: 'Farmer enrolled to programs successfully',
      data: null,
    });
  }
}
