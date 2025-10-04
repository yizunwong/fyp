import { Controller } from '@nestjs/common';
import { SubsidyService } from './subsidy.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subsidy')
@Controller('subsidy')
export class SubsidyController {
  constructor(private readonly subsidyService: SubsidyService) {}
}
