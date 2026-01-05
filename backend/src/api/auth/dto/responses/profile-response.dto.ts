import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'prisma/generated/prisma/client';

export class ProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty({ enum: Role })
  role!: Role;
}
