import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RetailerService {
  constructor(private readonly prisma: PrismaService) {}

  async listRetailersWithProfile() {
    return this.prisma.retailer.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
