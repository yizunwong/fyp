import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FarmVerificationStatus } from 'prisma/generated/prisma/enums';

export class UpdateFarmStatusDto {
  @ApiProperty({
    enum: FarmVerificationStatus,
    description: 'Verification status set by a government agency reviewer',
  })
  @IsEnum(FarmVerificationStatus)
  verificationStatus!: FarmVerificationStatus;
}
