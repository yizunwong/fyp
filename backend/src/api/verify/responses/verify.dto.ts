import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/client';

class ProduceFarmInfoDto {
  @ApiProperty({
    example: 'Organic Tomato',
    description: 'Name of the produce batch',
  })
  name!: string;

  @ApiProperty({
    example: '2025-10-30T00:00:00.000Z',
    description: 'Harvest date of the produce batch in ISO format',
  })
  harvestDate!: Date;

  @ApiPropertyOptional({
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  certifications?: JsonValue | null;

  @ApiProperty({
    example: 'Ali’s Organic Farm',
    nullable: true,
    description: 'Origin farm name',
  })
  farm?: string;
}

class BlockchainProofDto {
  @ApiProperty({
    example: '0xabc123...def456',
    description: 'Produce hash stored on-chain for immutability verification',
  })
  onChainHash!: string;

  @ApiProperty({
    example: '0xabc123...def456',
    description: 'Locally computed produce hash for integrity comparison',
  })
  offChainHash!: string;

  @ApiPropertyOptional({
    example:
      '0x10e12b152edb6679959b095faf6918e8c2cae6121ef91eab57d4302eea273325',
    description: 'Blockchain transaction hash where the produce was recorded',
    nullable: true,
    type: String,
  })
  blockchainTx?: string | null;
}

export class VerifyProduceResponseDto {
  @ApiProperty({
    example: 'BATCH123',
    description: 'Unique identifier of the produce batch',
  })
  batchId!: string;

  @ApiProperty({
    example: 'ONCHAIN_CONFIRMED',
    description: 'Current status of the produce record in the system',
  })
  status!: string;

  @ApiProperty({
    example: true,
    description:
      'Indicates if the QR code for this produce is publicly verifiable',
  })
  isPublicQR!: boolean;

  @ApiProperty({
    type: () => ProduceFarmInfoDto,
    description: 'Off-chain produce details used for verification display',
  })
  produce!: ProduceFarmInfoDto;

  @ApiProperty({
    type: () => BlockchainProofDto,
    description: 'Blockchain verification and transaction details',
  })
  blockchain!: BlockchainProofDto;

  constructor(partial: Partial<VerifyProduceResponseDto>) {
    Object.assign(this, partial);
  }
}
