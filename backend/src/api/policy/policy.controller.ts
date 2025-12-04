import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyResponseDto } from './dto/responses/policy-response.dto';
import { ApiCommonResponse } from 'src/common/decorators/api-common-response.decorator';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';

@ApiTags('policy')
@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  @ApiCommonResponse(PolicyResponseDto, false, 'Policy created successfully')
  async createPolicy(
    @Body() dto: CreatePolicyDto,
  ): Promise<CommonResponseDto<PolicyResponseDto>> {
    const policy = await this.policyService.createPolicy(dto);
    return new CommonResponseDto({
      statusCode: 201,
      message: 'Policy created successfully',
      data: policy,
    });
  }

  @Get()
  @ApiCommonResponse(PolicyResponseDto, true, 'Policies retrieved successfully')
  async getPolicies(): Promise<CommonResponseDto<PolicyResponseDto[]>> {
    const policies = await this.policyService.listPolicies();
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Policies retrieved successfully',
      data: policies,
      count: policies.length,
    });
  }

  @Get(':id')
  @ApiCommonResponse(PolicyResponseDto, false, 'Policy retrieved successfully')
  async getPolicy(
    @Param('id') id: string,
  ): Promise<CommonResponseDto<PolicyResponseDto>> {
    const policy = await this.policyService.getPolicyById(id);
    return new CommonResponseDto({
      statusCode: 200,
      message: 'Policy retrieved successfully',
      data: policy,
    });
  }
}
