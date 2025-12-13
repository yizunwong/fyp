import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RetailerProfileListResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty()
  companyName!: string;

  @ApiProperty()
  businessAddress!: string;

  @ApiProperty()
  verified!: boolean;
}
