import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubsidyService } from './subsidy.service';
import { RequestSubsidyDto } from './dto/request-subsidy.dto';

@ApiTags('subsidy')
@Controller('subsidy')
export class SubsidyController {
  constructor(private readonly subsidyService: SubsidyService) {}

  @Post()
  request(@Body() dto: RequestSubsidyDto) {
    return this.subsidyService.requestSubsidy(dto);
  }

  @Get('by-farmer/:farmerId')
  listByFarmer(@Param('farmerId') farmerId: string) {
    return this.subsidyService.listByFarmer(farmerId);
  }
}
