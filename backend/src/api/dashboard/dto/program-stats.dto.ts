import { ApiProperty } from '@nestjs/swagger';

export class ProgramStatsDto {
  @ApiProperty({ description: 'Count of programs currently active/enforced' })
  activePrograms!: number;

  @ApiProperty({ description: 'Count of programs in draft/review state' })
  draftPrograms!: number;

  @ApiProperty({ description: 'Count of archived programs' })
  archivedPrograms!: number;

  @ApiProperty({ description: 'Total programs across all statuses' })
  totalPrograms!: number;
}
