import { ApiProperty } from '@nestjs/swagger';
import {
  AreaUnit,
  FarmVerificationStatus,
  LandDocumentType,
} from 'prisma/generated/prisma/enums';

export class FarmDocumentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: LandDocumentType })
  type!: LandDocumentType;

  @ApiProperty()
  ipfsUrl!: string;

  @ApiProperty({ required: false, type: String, nullable: true })
  fileName?: string | null;

  @ApiProperty({ required: false, type: String, nullable: true })
  mimeType?: string | null;

  @ApiProperty({ required: false, type: Number, nullable: true })
  fileSize?: number | null;

  @ApiProperty()
  createdAt!: Date;
}

class PendingFarmFarmerDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  nric!: string;

  @ApiProperty({ required: false, type: String, nullable: true })
  phone?: string | null;
}

export class PendingFarmResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  address!: string;

  @ApiProperty()
  state!: string;

  @ApiProperty()
  district!: string;

  @ApiProperty({ enum: AreaUnit })
  sizeUnit!: AreaUnit;

  @ApiProperty()
  size!: number;

  @ApiProperty({ type: [String] })
  produceCategories!: string[];

  @ApiProperty({ enum: FarmVerificationStatus })
  verificationStatus!: FarmVerificationStatus;

  @ApiProperty({ type: PendingFarmFarmerDto })
  farmer!: PendingFarmFarmerDto;

  @ApiProperty({ type: [FarmDocumentDto] })
  farmDocuments!: FarmDocumentDto[];

  @ApiProperty()
  createdAt!: Date;

  constructor(partial: Partial<PendingFarmResponseDto>) {
    Object.assign(this, partial);
  }
}
