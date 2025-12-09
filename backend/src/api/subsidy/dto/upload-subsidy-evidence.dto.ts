import { ApiProperty } from '@nestjs/swagger';

export class UploadSubsidyEvidenceDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Photo or PDF evidence for the subsidy claim',
  })
  file!: any;
}
