import { Controller, Get, Post, Req, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchedulerMockService } from './scheduler.mock.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { CREATE_SCHEDULE_NAME_PARAMETER_REGEX } from '../constants/validation.constants';
import {
  AwsActionOptions,
  AwsRequestType,
  MockExceptionsFilter,
  ValidationErrorException,
  verifyV4Signature,
} from '@/src/common/mock';

// TODO: Probably need some interceptors for logging
// Could move filter to interceptor
@UseFilters(MockExceptionsFilter)
@ApiTags('EventBridge Scheduler Mock')
@Controller()
export class SchedulerMockController {
  constructor(
    private readonly schedulerMockService: SchedulerMockService,
    private readonly configService: ConfigService
  ) {}

  @Get('/schedules')
  async listSchedules(@Req() request: Request) {
    console.log('List Schedules OK');
  }

  @Post('/schedules/:name')
  async createSchedule(@Req() request: Request) {
    if (!CREATE_SCHEDULE_NAME_PARAMETER_REGEX.test(request.params.name)) {
      throw new ValidationErrorException('Name does not satisfy constraints.');
    }

    verifyV4Signature({
      request,
      configService: this.configService,
      awsRequestType: AwsRequestType.JsonRequest,
    });

    return await this.schedulerMockService.createSchedule({
      body: request.body,
    } as AwsActionOptions);
  }
}
