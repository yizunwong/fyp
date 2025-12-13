import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ProduceStatus } from 'prisma/generated/prisma/enums';

export class ListProduceQueryDto {
  @ApiPropertyOptional({
    description: 'Filter produce batches by status',
    enum: ProduceStatus,
    example: ProduceStatus.ARRIVED,
  })
  @IsOptional()
  @IsEnum(ProduceStatus)
  status?: ProduceStatus;
}
