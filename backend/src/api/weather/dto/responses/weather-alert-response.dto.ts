import { ApiProperty } from '@nestjs/swagger';

export class WeatherAlertResponseDto {
  @ApiProperty()
  location!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  updatedAt!: Date;
}
