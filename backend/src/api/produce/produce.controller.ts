import { Controller } from '@nestjs/common';
import { ProduceService } from './produce.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Produce')
@Controller('produce')
export class ProduceController {
  constructor(private readonly produceService: ProduceService) {}
}
