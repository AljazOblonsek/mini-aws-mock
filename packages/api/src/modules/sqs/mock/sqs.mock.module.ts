import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SqsQueue } from '../entities/sqs-queue.entity';
import { SqsMessage } from '../entities/sqs-message.entity';
import { SqsMessageHistory } from '../entities/sqs-message-history.entity';
import { SqsMockService } from './sqs.mock.service';
import { SqsMockCronService } from './sqs.mock-cron.service';
import { SseModule } from '@/src/common/core';

@Module({
  imports: [SequelizeModule.forFeature([SqsQueue, SqsMessage, SqsMessageHistory]), SseModule],
  providers: [SqsMockService, SqsMockCronService],
  exports: [SqsMockService],
})
export class SqsMockModule {}
