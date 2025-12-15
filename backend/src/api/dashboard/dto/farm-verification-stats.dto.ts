import { ApiProperty } from '@nestjs/swagger';

export class FarmVerificationStatsDto {
  @ApiProperty({
    description: 'Number of farms pending verification review',
  })
  pending!: number;

  @ApiProperty({
    description: 'Number of farms that have been verified',
  })
  verified!: number;

  @ApiProperty({
    description: 'Number of farms that have been rejected',
  })
  rejected!: number;

  @ApiProperty({
    description:
      'Number of documents uploaded for farms currently pending verification',
  })
  documents!: number;
}


