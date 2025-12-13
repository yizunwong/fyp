import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

class FarmerProfileResponseDto {
  @ApiProperty()
  id!: string;
}

class RetailerProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyName!: string;

  @ApiProperty()
  businessAddress!: string;

  @ApiProperty()
  verified!: boolean;
}

class AgencyProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  agencyName!: string;

  @ApiProperty()
  department!: string;
}

export class SetupProfileResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiPropertyOptional({ type: FarmerProfileResponseDto })
  farmer?: FarmerProfileResponseDto;

  @ApiPropertyOptional({ type: RetailerProfileResponseDto })
  retailer?: RetailerProfileResponseDto;

  @ApiPropertyOptional({ type: AgencyProfileResponseDto })
  agency?: AgencyProfileResponseDto;
}
