import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulerMockService } from './scheduler.mock.service';
import { SchedulerSchedule } from '../entities/scheduler-schedule.entity';
import { SchedulerMockController } from './scheduler.mock.controller';

@Module({
  imports: [SequelizeModule.forFeature([SchedulerSchedule])],
  providers: [SchedulerMockService],
  controllers: [SchedulerMockController],
})
export class SchedulerMockModule {}
