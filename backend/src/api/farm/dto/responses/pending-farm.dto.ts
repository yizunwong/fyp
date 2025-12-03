import { ApiProperty } from '@nestjs/swagger';
import {
  AreaUnit,
  FarmVerificationStatus,
  LandDocumentType,
} from 'prisma/generated/prisma/enums';

class PendingFarmDocumentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: LandDocumentType })
  type!: LandDocumentType;

  @ApiProperty()
  ipfsUrl!: string;

  @ApiProperty({ required: false })
  fileName?: string | null;

  @ApiProperty({ required: false })
  mimeType?: string | null;

  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
  phone?: string | null;
}

export class PendingFarmResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  location!: string;

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

  @ApiProperty({ type: [PendingFarmDocumentDto] })
  farmDocuments!: PendingFarmDocumentDto[];

  @ApiProperty()
  createdAt!: Date;

  constructor(partial: Partial<PendingFarmResponseDto>) {
    Object.assign(this, partial);
  }
}
