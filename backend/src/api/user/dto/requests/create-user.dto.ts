import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'prisma/generated/prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string | null;

  @ApiProperty({
    required: false,
    description: 'Must match password when provided',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  confirmPassword?: string | null;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nric!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiProperty({ enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    required: false,
    description: 'Retailer company name (required when role is RETAILER)',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({
    required: false,
    description: 'Retailer business address (required when role is RETAILER)',
  })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiProperty({
    required: false,
    description: 'Agency name (required when role is GOVERNMENT_AGENCY)',
  })
  @IsOptional()
  @IsString()
  agencyName?: string;

  @ApiProperty({
    required: false,
    description: 'Agency department (required when role is GOVERNMENT_AGENCY)',
  })
  @IsOptional()
  @IsString()
  department?: string;
}
