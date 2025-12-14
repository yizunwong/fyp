import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
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
    description:
      'Government agency name (required when role is GOVERNMENT_AGENCY)',
  })
  @IsOptional()
  @IsString()
  agencyName?: string;

  @ApiProperty({
    required: false,
    description:
      'Government agency department (required when role is GOVERNMENT_AGENCY)',
  })
  @IsOptional()
  @IsString()
  department?: string;
}
