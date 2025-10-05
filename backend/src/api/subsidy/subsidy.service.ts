import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestSubsidyDto } from './dto/request-subsidy.dto';
import { ensureFarmerExists } from 'src/common/helpers/farmer';

@Injectable()
export class SubsidyService {
  constructor(private readonly prisma: PrismaService) {}

  async requestSubsidy(farmerId: string, dto: RequestSubsidyDto) {
    await ensureFarmerExists(this.prisma, farmerId);
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
    await ensureFarmerExists(this.prisma, farmerId);
    return this.prisma.prisma.subsidy.findMany({ where: { farmerId } });
  }
}
