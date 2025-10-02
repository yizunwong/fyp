import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import * as dotenv from 'dotenv';
dotenv.config();

const prismaClient = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly prisma: typeof prismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
