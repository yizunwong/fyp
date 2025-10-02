import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getUsers() {
    return await this.prismaService.prisma.user.findMany(); // <-- access the model here
  }

  async createUser(data: CreateUserDto) {
    return await this.prismaService.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
    });
  }
}
