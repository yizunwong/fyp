import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';

@ApiTags('farm')
@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post()
  create(@Body() dto: CreateFarmDto) {
    return this.farmService.createFarm(dto);
  }

  @Get('by-farmer/:farmerId')
  listByFarmer(@Param('farmerId') farmerId: string) {
    return this.farmService.listFarmsByFarmer(farmerId);
  }
}
