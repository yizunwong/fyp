import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubsidyStatus } from 'prisma/generated/prisma/enums';
import { SubsidyEvidenceResponseDto } from './subsidy-evidence-response.dto';

class FarmerDetailsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  nric!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  phone?: string | null;
}

export class SubsidyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmerId!: string;

  @ApiPropertyOptional({ type: FarmerDetailsDto })
  farmer?: FarmerDetailsDto | null;

  @ApiPropertyOptional({
    description: 'Program id that triggered this request, if any',
    type: String,
    nullable: true,
  })
  programsId?: string | null;

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

  @ApiPropertyOptional({
    description: 'Evidence documents uploaded for this subsidy',
    type: [SubsidyEvidenceResponseDto],
  })
  evidences?: SubsidyEvidenceResponseDto[];

  constructor(partial: Partial<SubsidyResponseDto>) {
    Object.assign(this, partial);
  }
}
