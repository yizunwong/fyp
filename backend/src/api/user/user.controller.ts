import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/responses/user-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { UpdateProfileDto } from './dto/requests/update-profile.dto';
import { UpdateUserDto } from './dto/requests/update-user.dto';
import { UpdateProfileResponseDto } from './dto/responses/update-profile-response.dto';
import { UserDetailResponseDto } from './dto/responses/user-detail-response.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from 'prisma/generated/prisma/client';
import { RequestWithUser } from '../auth/types/request-with-user';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiCommonResponse(UserResponseDto, false, 'User created successfully')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CommonResponseDto<UserResponseDto>> {
    const user = await this.userService.createUser(createUserDto);
    return new CommonResponseDto({
      statusCode: 201,
      message: 'User created successfully',
      data: user,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCommonResponse(UserResponseDto, true, 'Users retrieved successfully')
  async findAll(
    @Query() query: ListUsersQueryDto,
  ): Promise<CommonResponseDto<UserResponseDto[]>> {
    const { data, total } = await this.userService.getUsers(query);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Users retrieved successfully',
      data,
      count: total,
    });
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(Role.FARMER, Role.RETAILER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCommonResponse(
    UpdateProfileResponseDto,
    false,
    'Profile retrieved successfully',
  )
  async getProfile(
    @Req() req: RequestWithUser,
  ): Promise<CommonResponseDto<UpdateProfileResponseDto>> {
    const profile = await this.userService.getProfile(req.user.id);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: profile,
    });
  }

  @Patch('/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.RETAILER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCommonResponse(
    UpdateProfileResponseDto,
    false,
    'Profile updated successfully',
  )
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<CommonResponseDto<UpdateProfileResponseDto>> {
    const profile = await this.userService.updateProfile(req.user.id, dto);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Profile updated successfully',
      data: profile,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.RETAILER, Role.GOVERNMENT_AGENCY, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCommonResponse(
    UserDetailResponseDto,
    false,
    'User details retrieved successfully',
  )
  async findOne(
    @Param('id') id: string,
  ): Promise<CommonResponseDto<UserDetailResponseDto>> {
    const user = await this.userService.getUserById(id);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'User details retrieved successfully',
      data: user,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCommonResponse(UserDetailResponseDto, false, 'User updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<CommonResponseDto<UserDetailResponseDto>> {
    const user = await this.userService.updateUser(id, updateUserDto);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'User updated successfully',
      data: user,
    });
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
