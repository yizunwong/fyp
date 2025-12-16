import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email address associated with the account',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;
}
