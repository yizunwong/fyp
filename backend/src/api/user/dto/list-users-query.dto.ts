import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'prisma/generated/prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter users by role',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Search by email, username, or NRIC (case-insensitive)',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
