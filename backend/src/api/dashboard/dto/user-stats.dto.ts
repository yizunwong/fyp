import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers!: number;

  @ApiProperty({ description: 'Number of farmers' })
  farmers!: number;

  @ApiProperty({ description: 'Number of retailers' })
  retailers!: number;

  @ApiProperty({ description: 'Number of government agencies' })
  agencies!: number;

  @ApiProperty({ description: 'Number of admins' })
  admins!: number;
}

