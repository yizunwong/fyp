import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserStatus } from 'prisma/generated/prisma/enums';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    description: 'Must match password when provided',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  confirmPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nric?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Retailer company name (required when role is RETAILER)',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Retailer business address (required when role is RETAILER)',
  })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiPropertyOptional({
    description: 'Agency name (required when role is GOVERNMENT_AGENCY)',
  })
  @IsOptional()
  @IsString()
  agencyName?: string;

  @ApiPropertyOptional({
    description: 'Agency department (required when role is GOVERNMENT_AGENCY)',
  })
  @IsOptional()
  @IsString()
  department?: string;
}
