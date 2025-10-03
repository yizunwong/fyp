import { Controller } from '@nestjs/common';
import { FarmerService } from './farmer.service';

@Controller('farmer')
export class FarmerController {
  constructor(private readonly farmerService: FarmerService) {}
}
