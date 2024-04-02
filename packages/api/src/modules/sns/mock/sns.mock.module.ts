import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SnsTopic } from '../entities/sns-topic.entity';
import { SnsTopicPublishHistory } from '../entities/sns-topic-publish-history.entity';
import { SnsMockService } from './sns.mock.service';
import { SseModule } from '@/src/common/core';

@Module({
  imports: [SequelizeModule.forFeature([SnsTopic, SnsTopicPublishHistory]), SseModule],
  providers: [SnsMockService],
  exports: [SnsMockService],
})
export class SnsMockModule {}
