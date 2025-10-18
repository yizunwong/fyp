import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/responses/user-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';

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
}
