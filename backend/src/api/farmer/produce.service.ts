import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProduceDto } from './dto/create-produce.dto';

@Injectable()
export class ProduceService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduce(dto: CreateProduceDto) {
    const farm = await this.prisma.prisma.farm.findUnique({
      where: { id: dto.farmId },
    });
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    return this.prisma.prisma.produce.create({
      data: {
        farmId: dto.farmId,
        name: dto.name,
        batchId: dto.batchId,
        certifications: dto.certifications ?? undefined,
        harvestDate: new Date(dto.harvestDate),
      },
    });
  }
}
