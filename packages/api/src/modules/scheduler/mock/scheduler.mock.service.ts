import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulerSchedule } from '../entities/scheduler-schedule.entity';
import { AwsActionOptions, ValidationErrorException } from '@/src/common/mock';
import { plainToInstance } from 'class-transformer';
import { CreateScheduleRequestDto } from './dtos/create-schedule-request.dto';
import { validate } from 'class-validator';

@Injectable()
export class SchedulerMockService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(SchedulerSchedule)
    private readonly eventBridgeScheduleModel: typeof SchedulerSchedule
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async createSchedule({ body }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(CreateScheduleRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }
  }
}
