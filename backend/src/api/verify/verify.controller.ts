import { Controller, Get, Logger, Param } from '@nestjs/common';
import { formatError } from 'src/common/helpers/error';
import { ProduceService } from '../produce/produce.service';
import { VerifyProduceResponseDto } from './responses/verify.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';

@Controller('verify')
export class VerifyController {
  private readonly logger = new Logger(VerifyController.name);

  constructor(private readonly produceService: ProduceService) {}

  // GET /verify/:batchId -> verify authenticity of a produce batch
  @Get(':batchId')
  @ApiCommonResponse(
    VerifyProduceResponseDto,
    false,
    'Produce batch verified successfully',
  )
  async verifyBatch(
    @Param('batchId') batchId: string,
  ): Promise<CommonResponseDto<VerifyProduceResponseDto>> {
    try {
      const verfiedProduce = await this.produceService.verifyProduce(batchId);
      return new CommonResponseDto({
        statusCode: 200,
        message: 'Produce batch verified successfully',
        data: verfiedProduce,
      });
    } catch (e) {
      // Log for diagnostics, Nest will format thrown HTTP exceptions
      this.logger.error(`verifyBatch failed for ${batchId}: ${formatError(e)}`);
      throw e;
    }
  }
}
