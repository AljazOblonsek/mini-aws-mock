import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SqsQueue } from '../entities/sqs-queue.entity';
import { SqsMessage } from '../entities/sqs-message.entity';
import { SqsMessageHistory } from '../entities/sqs-message-history.entity';
import { SqsApiController } from './sqs.api.controller';
import { SqsApiService } from './sqs.api.service';

@Module({
  imports: [SequelizeModule.forFeature([SqsQueue, SqsMessage, SqsMessageHistory])],
  controllers: [SqsApiController],
  providers: [SqsApiService],
})
export class SqsApiModule {}
