import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export async function ensureFarmerExists(
  prisma: PrismaService,
  farmerId: string,
) {
  const farmer = await prisma.prisma.user.findUnique({
    where: { id: farmerId },
  });
  if (!farmer) {
    throw new NotFoundException('Farmer not found');
  }
  return farmer;
}
