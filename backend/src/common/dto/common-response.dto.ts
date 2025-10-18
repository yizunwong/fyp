import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommonResponseDto<T = unknown> {
  @ApiProperty()
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional()
  count?: number;

  constructor(partial: Partial<CommonResponseDto<T>>) {
    Object.assign(this, partial);
  }
}
