import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
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
  @ApiCommonResponse(UserResponseDto, true, 'Users retrieved successfully')
  async findAll(): Promise<CommonResponseDto<UserResponseDto[]>> {
    const users = await this.userService.getUsers();
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length,
    });
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
