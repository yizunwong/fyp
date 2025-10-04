import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';

@Injectable()
export class FarmService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureFarmerExists(farmerId: string) {
    const farmer = await this.prisma.prisma.user.findUnique({
      where: { id: farmerId },
    });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }
    return farmer;
  }

  async createFarm(farmerId: string, dto: CreateFarmDto) {
    await this.ensureFarmerExists(farmerId);
    try {
      return await this.prisma.prisma.farm.create({
        data: {
          name: dto.name,
          location: dto.location,
          documents: dto.documents ?? undefined,
          farmerId,
        },
      });
    } catch (e) {
      throw new BadRequestException('Failed to create farm', e as string);
    }
  }

  async listFarms(farmerId: string) {
    await this.ensureFarmerExists(farmerId);
    return this.prisma.prisma.farm.findMany({
      where: { farmerId },
      include: { produces: true },
    });
  }
}
