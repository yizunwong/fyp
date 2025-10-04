import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProduceDto } from './dto/create-produce.dto';

@Injectable()
export class ProduceService {
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

  async createProduce(farmerId: string, farmId: string, dto: CreateProduceDto) {
    await this.ensureFarmerExists(farmerId);
    const farm = await this.prisma.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });
    if (!farm) {
      throw new NotFoundException('Farm not found for this farmer');
    }

    let harvestDate: Date;
    try {
      harvestDate = new Date(dto.harvestDate);
      if (isNaN(harvestDate.getTime())) throw new Error('Invalid date');
    } catch {
      throw new BadRequestException('Invalid harvestDate');
    }

    try {
      return await this.prisma.prisma.produce.create({
        data: {
          farmId: farmId,
          name: dto.name,
          batchId: dto.batchId,
          harvestDate,
          certifications: dto.certifications ?? undefined,
        },
      });
    } catch (e) {
      throw new BadRequestException('Failed to create produce', e as string);
    }
  }

  async listProduce(farmerId: string, farmId: string) {
    await this.ensureFarmerExists(farmerId);
    return this.prisma.prisma.produce.findMany({
      where: { farm: { farmerId, id: farmId } },
      include: { farm: true },
    });
  }
}
