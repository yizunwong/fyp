import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/responses/user-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { UpdateProfileDto } from './dto/requests/update-profile.dto';
import { UpdateProfileResponseDto } from './dto/responses/update-profile-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
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
}
