import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';

@Injectable()
export class FarmService {
  constructor(private readonly prisma: PrismaService) {}

  async createFarm(dto: CreateFarmDto) {
    const farmer = await this.prisma.prisma.user.findUnique({
      where: { id: dto.farmerId },
    });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    return this.prisma.prisma.farm.create({
      data: {
        farmerId: dto.farmerId,
        name: dto.name,
        location: dto.location,
        documents: dto.documents ?? undefined,
      },
    });
  }

  async listFarmsByFarmer(farmerId: string) {
    const farmer = await this.prisma.prisma.user.findUnique({
      where: { id: farmerId },
    });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    return this.prisma.prisma.farm.findMany({
      where: { farmerId },
      include: { produces: true },
    });
  }
}
