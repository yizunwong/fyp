import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestSubsidyDto } from './dto/request-subsidy.dto';

@Injectable()
export class SubsidyService {
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

  async requestSubsidy(farmerId: string, dto: RequestSubsidyDto) {
    await this.ensureFarmerExists(farmerId);
    try {
      return await this.prisma.prisma.subsidy.create({
        data: {
          farmerId,
          amount: dto.amount,
          weatherEventId: dto.weatherEventId ?? undefined,
        },
      });
    } catch (e) {
      throw new BadRequestException(
        'Failed to create subsidy request',
        e as string,
      );
    }
  }

  async listSubsidies(farmerId: string) {
    await this.ensureFarmerExists(farmerId);
    return this.prisma.prisma.subsidy.findMany({ where: { farmerId } });
  }
}
