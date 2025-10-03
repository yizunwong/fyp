import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
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
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
