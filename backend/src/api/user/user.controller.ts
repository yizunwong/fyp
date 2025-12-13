import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/responses/user-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { SetupProfileDto } from './dto/requests/setup-profile.dto';
import { SetupProfileResponseDto } from './dto/responses/setup-profile-response.dto';
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

  @Post('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiCommonResponse(
    SetupProfileResponseDto,
    false,
    'Profile set up successfully',
  )
  async setupProfile(
    @Req() req: RequestWithUser,
    @Body() dto: SetupProfileDto,
  ): Promise<CommonResponseDto<SetupProfileResponseDto>> {
    const profile = await this.userService.setupProfile(req.user.id, dto);
    return new CommonResponseDto({
      statusCode: 201,
      message: 'Profile set up successfully',
      data: profile,
    });
  }
}
