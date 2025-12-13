import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import bcrypt from 'bcrypt';
import { Prisma, Role, User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { generateFromEmail } from 'unique-username-generator';
import { SetupProfileDto } from './dto/requests/setup-profile.dto';
import { SetupProfileResponseDto } from './dto/responses/setup-profile-response.dto';

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

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            username: data.username ?? generateFromEmail(data.email, 5),
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

        // Auto-create farmer profile for FARMER role
        if (user.role === Role.FARMER) {
          await tx.farmer.create({
            data: { id: user.id },
          });
        }

        return user;
      });

      return created;
    } catch (err: unknown) {
      handlePrismaError(err);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async setupProfile(
    userId: string,
    data: SetupProfileDto,
  ): Promise<SetupProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const baseResponse = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    switch (user.role) {
      case Role.FARMER: {
        const existing = await this.prisma.farmer.findUnique({
          where: { id: user.id },
        });
        if (existing) {
          throw new BadRequestException('Farmer profile already exists');
        }

        const farmer = await this.prisma.farmer.create({
          data: { id: user.id },
        });

        return { ...baseResponse, farmer };
      }
      case Role.RETAILER: {
        if (!data.companyName || !data.businessAddress) {
          throw new BadRequestException(
            'companyName and businessAddress are required to set up a retailer profile',
          );
        }

        const existing = await this.prisma.retailer.findUnique({
          where: { id: user.id },
        });
        if (existing) {
          throw new BadRequestException('Retailer profile already exists');
        }

        const retailer = await this.prisma.retailer.create({
          data: {
            id: user.id,
            companyName: data.companyName,
            businessAddress: data.businessAddress,
          },
        });

        return { ...baseResponse, retailer };
      }
      case Role.GOVERNMENT_AGENCY: {
        if (!data.agencyName || !data.department) {
          throw new BadRequestException(
            'agencyName and department are required to set up an agency profile',
          );
        }

        const existing = await this.prisma.agency.findUnique({
          where: { id: user.id },
        });
        if (existing) {
          throw new BadRequestException('Agency profile already exists');
        }

        const agency = await this.prisma.agency.create({
          data: {
            id: user.id,
            agencyName: data.agencyName,
            department: data.department,
          },
        });

        return { ...baseResponse, agency };
      }
      default:
        throw new BadRequestException(
          `Profile setup is not supported for role ${user.role}`,
        );
    }
  }
}

type DriverAdapterError = {
  cause?: {
    constraint?: {
      fields?: string[];
    };
  };
};

export function handlePrismaError(err: unknown) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      let field: string | undefined;

      const target = err.meta?.target as string[] | undefined;
      field = target?.[0];
      const driverError = err?.meta?.driverAdapterError as
        | DriverAdapterError
        | undefined;
      field = field ?? driverError?.cause?.constraint?.fields?.[0];

      if (!field && typeof err?.message === 'string') {
        const match = err.message.match(/unique constraint "(.+?)"/);
        if (match) {
          const parts = match[1].split('_');
          field = parts[1];
        }
      }

      switch (field) {
        case 'email':
          throw new BadRequestException('Email is already registered');
        case 'username':
          throw new BadRequestException('Username is already taken');
        case 'nric':
          throw new BadRequestException('NRIC is already registered');
        default:
          throw new BadRequestException('Duplicate value for: ' + field);
      }
    }
  }

  throw new BadRequestException('Failed to create user');
}
