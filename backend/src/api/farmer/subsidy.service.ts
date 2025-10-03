import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestSubsidyDto } from './dto/request-subsidy.dto';

@Injectable()
export class SubsidyService {
  constructor(private readonly prisma: PrismaService) {}

  async requestSubsidy(dto: RequestSubsidyDto) {
    const farmer = await this.prisma.prisma.user.findUnique({
      where: { id: dto.farmerId },
    });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    return this.prisma.prisma.subsidy.create({
      data: {
        farmerId: dto.farmerId,
        amount: dto.amount,
        weatherEventId: dto.weatherEventId ?? undefined,
      },
    });
  }

  async listByFarmer(farmerId: string) {
    const farmer = await this.prisma.prisma.user.findUnique({
      where: { id: farmerId },
    });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    return this.prisma.prisma.subsidy.findMany({ where: { farmerId } });
  }
}
