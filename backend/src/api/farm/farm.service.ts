import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { ensureFarmerExists } from 'src/common/helpers/farmer';
import { formatError } from 'src/common/helpers/error';

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
    });
  }
}
