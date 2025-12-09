import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubsidyStatus } from 'prisma/generated/prisma/enums';

export class SubsidyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmerId!: string;

  @ApiPropertyOptional({
    description: 'Policy id that triggered this request, if any',
    type: String,
    nullable: true,
  })
  policyId?: string | null;

  @ApiPropertyOptional({
    description: 'Weather event id that triggered this request, if any',
    type: String,
    nullable: true,
  })
  weatherEventId?: string | null;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: SubsidyStatus })
  status!: SubsidyStatus;

  @ApiPropertyOptional({
    description: 'Keccak256 hash of off-chain claim payload',
    type: String,
    nullable: true,
  })
  metadataHash?: string | null;

  @ApiPropertyOptional({
    description: 'On-chain claim id (as string for bigint safety)',
    type: Number,
  })
  onChainClaimId?: number | null;

  @ApiPropertyOptional({
    description: 'Tx hash for on-chain interactions',
    type: String,
    nullable: true,
  })
  onChainTxHash?: string | null;

  @ApiPropertyOptional({
    description: 'If rejected, the reason',
    type: String,
    nullable: true,
  })
  rejectionReason?: string | null;

  @ApiProperty()
  @Type(() => Date)
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Date and time the subsidy was approved',
    type: Date,
    nullable: true,
  })
  @Type(() => Date)
  approvedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Date and time the subsidy was paid',
    type: Date,
    nullable: true,
  })
  @Type(() => Date)
  paidAt?: Date | null;

  constructor(partial: Partial<SubsidyResponseDto>) {
    Object.assign(this, partial);
  }
}
