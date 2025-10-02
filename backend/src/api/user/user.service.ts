import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getUsers() {
    return await this.prismaService.prisma.user.findMany(); // <-- access the model here
  }

  async createUser(data: CreateUserDto) {
    const hashed = await bcrypt.hash(data.password, 10);
    return await this.prismaService.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashed,
        role: (data.role as any) ?? 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.prisma.user.findUnique({ where: { email } });
  }
}
