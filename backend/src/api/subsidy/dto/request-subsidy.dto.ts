import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RequestSubsidyDto {
  @ApiProperty({
    description: 'On-chain claim id (uint256) returned by the contract',
  })
  @IsNotEmpty()
  @Type(() => BigInt)
  onChainClaimId!: bigint;

  @ApiProperty({ description: 'On-chain transaction hash (0x-prefixed)' })
  @IsNotEmpty()
  @IsString()
  onChainTxHash!: string;

  @ApiProperty({ description: 'Requested subsidy amount (in fiat equivalent)' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Associated policy id (must exist if provided)',
  })
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional({
    description: 'Weather event id that triggered this request, if any',
  })
  @IsOptional()
  @IsString()
  weatherEventId?: string;

  @ApiProperty({
    description:
      'Keccak256 hash (0x-prefixed) of the off-chain claim metadata bundle',
    example: '0x' + 'a'.repeat(64),
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'metadataHash must be a 0x-prefixed 64-hex-character string',
  })
  metadataHash!: string;
}
