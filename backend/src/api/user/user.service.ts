import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { generateFromEmail } from 'unique-username-generator';

@ApiTags('users')
@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getUsers() {
    return await this.prismaService.prisma.user.findMany(); // <-- access the model here
  }

  async createUser(data: CreateUserDto) {
    let hashed: string | null = null;

    if (data.password) {
      hashed = await bcrypt.hash(data.password, 10);
    }

    if (!data.username) {
      data.username = generateFromEmail(data.email, 5);
    }

    return await this.prismaService.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashed,
        nric: data.nric,
        phone: data.phone,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.prisma.user.findUnique({ where: { email } });
  }
}
