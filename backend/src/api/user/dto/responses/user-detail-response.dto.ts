import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, UserStatus } from 'prisma/generated/prisma/enums';

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
}

class AgencyProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  agencyName!: string;

  @ApiProperty()
  department!: string;
}

export class UserDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty()
  nric!: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: FarmerProfileResponseDto })
  farmer?: FarmerProfileResponseDto;

  @ApiPropertyOptional({ type: RetailerProfileResponseDto })
  retailer?: RetailerProfileResponseDto;

  @ApiPropertyOptional({ type: AgencyProfileResponseDto })
  agency?: AgencyProfileResponseDto;
}
