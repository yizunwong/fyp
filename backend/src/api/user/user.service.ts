import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { generateFromEmail } from 'unique-username-generator';

@ApiTags('users')
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });
  }

  async createUser(data: CreateUserDto) {
    let hashed: string | null = null;

    if (data.password) {
      hashed = await bcrypt.hash(data.password, 10);
    }

    if (!data.username) {
      data.username = generateFromEmail(data.email, 5);
    }

    return await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashed,
        nric: data.nric,
        phone: data.phone ?? null,
        role: data.role ?? Role.FARMER,
        provider: data.provider ?? 'local',
        providerId: data.providerId ?? null,
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
    return this.prisma.user.findUnique({ where: { email } });
  }
}
