import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { SubsidyStatus } from '@prisma/client';

export class UpdateOnChainSubsidyDto {
  @ApiProperty({
    description: 'On-chain claim id (uint256) returned by the contract',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'onChainClaimId must be a numeric string' })
  onChainClaimId!: string;

  @ApiPropertyOptional({
    description: 'On-chain transaction hash for tracking',
    example: '0x' + 'a'.repeat(64),
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'onChainTxHash must be a 0x-prefixed 64-hex-character string',
  })
  onChainTxHash?: string;

  @ApiPropertyOptional({ enum: SubsidyStatus })
  @IsOptional()
  @IsEnum(SubsidyStatus)
  status?: SubsidyStatus;
}
