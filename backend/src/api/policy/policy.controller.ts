import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyResponseDto } from './dto/responses/policy-response.dto';

@ApiTags('policy')
@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  @ApiBody({ type: CreatePolicyDto })
  @ApiCreatedResponse({ type: PolicyResponseDto })
  createPolicy(@Body() dto: CreatePolicyDto): Promise<PolicyResponseDto> {
    return this.policyService.createPolicy(dto);
  }

  @Get()
  @ApiOkResponse({ type: [PolicyResponseDto] })
  getPolicies(): Promise<PolicyResponseDto[]> {
    return this.policyService.listPolicies();
  }

  @Get(':id')
  @ApiOkResponse({ type: PolicyResponseDto })
  getPolicy(@Param('id') id: string): Promise<PolicyResponseDto> {
    return this.policyService.getPolicyById(id);
  }
}
