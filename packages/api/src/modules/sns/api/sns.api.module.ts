import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SnsTopic } from '../entities/sns-topic.entity';
import { SnsTopicPublishHistory } from '../entities/sns-topic-publish-history.entity';
import { SnsApiController } from './sns.api.controller';
import { SnsApiService } from './sns.api.service';

@Module({
  imports: [SequelizeModule.forFeature([SnsTopic, SnsTopicPublishHistory])],
  controllers: [SnsApiController],
  providers: [SnsApiService],
})
export class SnsApiModule {}
