import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RecentRegistrationDto {
  @ApiProperty({ description: 'Farm ID' })
  id!: string;

  @ApiProperty({ description: 'Farm name' })
  name!: string;

  @ApiProperty({ description: 'Farmer ID' })
  farmerId!: string;

  @ApiProperty({ description: 'Farm address' })
  address!: string;

  @ApiProperty({ description: 'Farm state' })
  state!: string;

  @ApiProperty({ description: 'Farm district' })
  district!: string;

  @ApiProperty({ description: 'Verification status' })
  verificationStatus!: string;

  @ApiProperty({ description: 'Date farm was created' })
  @Type(() => Date)
  createdAt!: Date;
}

export class PendingClaimDto {
  @ApiProperty({ description: 'Subsidy ID' })
  id!: string;

  @ApiProperty({ description: 'Program name' })
  programName!: string;

  @ApiProperty({ description: 'Subsidy amount' })
  amount!: number;

  @ApiProperty({ description: 'Farmer name' })
  farmerName!: string;

  @ApiProperty({ description: 'Farm state' })
  state!: string;

  @ApiProperty({ description: 'Subsidy status' })
  status!: string;

  @ApiProperty({ description: 'Date subsidy was created' })
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({
    description: 'On-chain transaction hash if available',
    nullable: true,
  })
  onChainTxHash?: string | null;
}

export class ActiveProgramDto {
  @ApiProperty({ description: 'Program ID' })
  id!: string;

  @ApiProperty({ description: 'Program name' })
  name!: string;

  @ApiProperty({ description: 'Program type' })
  type!: string;

  @ApiProperty({ description: 'Program start date' })
  @Type(() => Date)
  startDate!: Date;

  @ApiProperty({ description: 'Program end date' })
  @Type(() => Date)
  endDate!: Date;

  @ApiProperty({ description: 'Program status' })
  status!: string;

  @ApiProperty({ description: 'Payout amount', nullable: true, type: Number })
  payoutAmount?: number | null;
}

export class AgencyDashboardDto {
  @ApiProperty({ description: 'Farms pending review' })
  pendingReview!: number;

  @ApiProperty({ description: 'Subsidies that are on-chain' })
  onChain!: number;

  @ApiProperty({ description: 'Approved subsidies' })
  approved!: number;

  @ApiProperty({ description: 'Documents requiring verification' })
  docsRequired!: number;

  @ApiProperty({
    description: 'Recent farm registrations',
    type: [RecentRegistrationDto],
  })
  recentRegistrations!: RecentRegistrationDto[];

  @ApiProperty({
    description: 'Pending subsidy claims',
    type: [PendingClaimDto],
  })
  pendingClaims!: PendingClaimDto[];

  @ApiProperty({
    description: 'Active programs owned by the agency',
    type: [ActiveProgramDto],
  })
  activePrograms!: ActiveProgramDto[];
}
