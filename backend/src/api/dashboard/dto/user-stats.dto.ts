import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers!: number;

  @ApiProperty({ description: 'Number of active users' })
  active!: number;

  @ApiProperty({ description: 'Number of inactive users' })
  inactive!: number;

  @ApiProperty({ description: 'Number of suspended users' })
  suspended!: number;

  @ApiProperty({ description: 'Number of users pending verification' })
  pendingVerification!: number;
}

