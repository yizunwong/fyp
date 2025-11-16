import { ApiProperty } from '@nestjs/swagger';

export class UploadProduceImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Produce image to upload',
  })
  image!: string;
}
