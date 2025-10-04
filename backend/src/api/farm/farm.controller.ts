import { Controller } from '@nestjs/common';
import { FarmService } from './farm.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('farm')
@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}
}
