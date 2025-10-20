import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { ensureFarmerExists } from 'src/common/helpers/farmer';
import { formatError } from 'src/common/helpers/error';
import { UpdateFarmDto } from './dto/update-farm.dto';

@Injectable()
export class FarmService {
  private readonly logger = new Logger(FarmService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createFarm(farmerId: string, dto: CreateFarmDto) {
    await ensureFarmerExists(this.prisma, farmerId);
    try {
      return await this.prisma.prisma.farm.create({
        data: {
          name: dto.name,
          location: dto.location,
          size: dto.size,
          sizeUnit: dto.sizeUnit,
          produceCategories: dto.produceCategories,
          documents: dto.documents ?? undefined,
          farmerId,
        },
      });
    } catch (e) {
      this.logger.error(`createFarm error: ${formatError(e)}`);
      throw new BadRequestException('Failed to create farm', e as string);
    }
  }

  async listFarms(farmerId: string) {
    await ensureFarmerExists(this.prisma, farmerId);
    return this.prisma.prisma.farm.findMany({
      where: { farmerId },
      include: { produces: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFarm(farmerId: string, farmId: string) {
    await ensureFarmerExists(this.prisma, farmerId);

    const farm = await this.prisma.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
      include: { produces: true },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    return farm;
  }

  async updateFarm(farmerId: string, farmId: string, dto: UpdateFarmDto) {
    await ensureFarmerExists(this.prisma, farmerId);

    const existing = await this.prisma.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });

    if (!existing) {
      throw new NotFoundException('Farm not found');
    }

    try {
      return await this.prisma.prisma.farm.update({
        where: { id: farmId },
        data: {
          name: dto.name ?? undefined,
          location: dto.location ?? undefined,
          size: dto.size ?? undefined,
          sizeUnit: dto.sizeUnit ?? undefined,
          produceCategories: dto.produceCategories ?? undefined,
          documents: dto.documents ?? undefined,
        },
      });
    } catch (e) {
      this.logger.error(`updateFarm error: ${formatError(e)}`);
      throw new BadRequestException('Failed to update farm', e as string);
    }
  }

  async deleteFarm(farmerId: string, farmId: string) {
    await ensureFarmerExists(this.prisma, farmerId);

    const existing = await this.prisma.prisma.farm.findFirst({
      where: { id: farmId, farmerId },
    });

    if (!existing) {
      throw new NotFoundException('Farm not found');
    }

    try {
      await this.prisma.prisma.farm.delete({ where: { id: farmId } });
      return { success: true };
    } catch (e) {
      this.logger.error(`deleteFarm error: ${formatError(e)}`);
      throw new BadRequestException('Failed to delete farm', e as string);
    }
  }
}
