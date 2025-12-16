import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from the email link',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'New password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'Confirm new password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}
