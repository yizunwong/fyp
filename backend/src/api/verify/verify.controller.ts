import { Controller, Get, Logger, Param } from '@nestjs/common';
import { formatError } from 'src/common/helpers/error';
import { ProduceService } from '../produce/produce.service';

@Controller('verify')
export class VerifyController {
  private readonly logger = new Logger(VerifyController.name);

  constructor(private readonly produceService: ProduceService) {}

  // GET /verify/:batchId -> verify authenticity of a produce batch
  @Get(':batchId')
  async verifyBatch(@Param('batchId') batchId: string) {
    try {
      return await this.produceService.verifyProduce(batchId);
    } catch (e) {
      // Log for diagnostics, Nest will format thrown HTTP exceptions
      this.logger.error(`verifyBatch failed for ${batchId}: ${formatError(e)}`);
      throw e;
    }
  }
}
