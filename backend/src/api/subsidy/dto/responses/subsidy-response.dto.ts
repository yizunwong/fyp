import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubsidyStatus } from 'prisma/generated/prisma/enums';

export class SubsidyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmerId!: string;

  @ApiPropertyOptional()
  policyId?: string | null;

  @ApiPropertyOptional()
  weatherEventId?: string | null;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: SubsidyStatus })
  status!: SubsidyStatus;

  @ApiPropertyOptional({
    description: 'Keccak256 hash of off-chain claim payload',
  })
  metadataHash?: string | null;

  @ApiPropertyOptional({
    description: 'On-chain claim id (as string for bigint safety)',
    type: BigInt,
  })
  onChainClaimId?: bigint | null;

  @ApiPropertyOptional({ description: 'Tx hash for on-chain interactions' })
  onChainTxHash?: string | null;

  @ApiPropertyOptional({ description: 'If rejected, the reason' })
  rejectionReason?: string | null;

  @ApiProperty()
  @Type(() => Date)
  createdAt!: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  approvedAt?: Date | null;

  @ApiPropertyOptional()
  @Type(() => Date)
  paidAt?: Date | null;

  constructor(partial: Partial<SubsidyResponseDto>) {
    Object.assign(this, partial);
  }
}
