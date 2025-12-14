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
import { UpdateProfileDto } from './dto/requests/update-profile.dto';
import { UpdateProfileResponseDto } from './dto/responses/update-profile-response.dto';

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

        switch (user.role) {
          case Role.FARMER:
            await tx.farmer.create({
              data: { id: user.id },
            });
            break;
          case Role.RETAILER: {
            if (!data.companyName || !data.businessAddress) {
              throw new BadRequestException(
                'companyName and businessAddress are required to create a retailer profile',
              );
            }

            await tx.retailer.create({
              data: {
                id: user.id,
                companyName: data.companyName,
                businessAddress: data.businessAddress,
              },
            });
            break;
          }
          case Role.GOVERNMENT_AGENCY: {
            if (!data.agencyName || !data.department) {
              throw new BadRequestException(
                'agencyName and department are required to create an agency profile',
              );
            }

            await tx.agency.create({
              data: {
                id: user.id,
                agencyName: data.agencyName,
                department: data.department,
              },
            });
            break;
          }
          default:
            break;
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

  async getProfile(userId: string): Promise<UpdateProfileResponseDto> {
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
        const farmer = await this.prisma.farmer.findUnique({
          where: { id: user.id },
          select: { id: true },
        });
        return { ...baseResponse, farmer: farmer ?? undefined };
      }
      case Role.RETAILER: {
        const retailer = await this.prisma.retailer.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            companyName: true,
            businessAddress: true,
            verified: true,
          },
        });
        return { ...baseResponse, retailer: retailer ?? undefined };
      }
      case Role.GOVERNMENT_AGENCY: {
        const agency = await this.prisma.agency.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            agencyName: true,
            department: true,
          },
        });
        return { ...baseResponse, agency: agency ?? undefined };
      }
      default:
        throw new BadRequestException(
          `Profile retrieval is not supported for role ${user.role}`,
        );
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<UpdateProfileResponseDto> {
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
        const farmer = await this.prisma.farmer.upsert({
          where: { id: user.id },
          update: {},
          create: { id: user.id },
        });

        return { ...baseResponse, farmer };
      }
      case Role.RETAILER: {
        if (!data.companyName || !data.businessAddress) {
          throw new BadRequestException(
            'companyName and businessAddress are required to update a retailer profile',
          );
        }

        const retailer = await this.prisma.retailer.upsert({
          where: { id: user.id },
          update: {
            companyName: data.companyName,
            businessAddress: data.businessAddress,
          },
          create: {
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
            'agencyName and department are required to update an agency profile',
          );
        }

        const agency = await this.prisma.agency.upsert({
          where: { id: user.id },
          update: {
            agencyName: data.agencyName,
            department: data.department,
          },
          create: {
            id: user.id,
            agencyName: data.agencyName,
            department: data.department,
          },
        });

        return { ...baseResponse, agency };
      }
      default:
        throw new BadRequestException(
          `Profile update is not supported for role ${user.role}`,
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
        case 'nric':
          throw new BadRequestException('NRIC is already registered');
        default:
          throw new BadRequestException('Duplicate value for: ' + field);
      }
    }
  }

  throw new BadRequestException('Failed to create user');
}
