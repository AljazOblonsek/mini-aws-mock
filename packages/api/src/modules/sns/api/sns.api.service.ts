import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SnsTopic } from '../entities/sns-topic.entity';
import {
  SnsTopicCreateRequestDto,
  SnsTopicDto,
  SnsTopicPublishHistoryDto,
} from '@mini-aws-mock/shared';
import { generateTopicArn } from '../utils/generate-topic-arn';
import { ConfigService } from '@nestjs/config';
import { SnsTopicPublishHistory } from '../entities/sns-topic-publish-history.entity';

@Injectable()
export class SnsApiService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SnsTopic) private readonly snsTopicModel: typeof SnsTopic,
    @InjectModel(SnsTopicPublishHistory)
    private readonly snsTopicPublishHistoryModel: typeof SnsTopicPublishHistory
  ) {}

  async getTopics(): Promise<SnsTopicDto[]> {
    const topics = await this.snsTopicModel.findAll();

    const topicDtos: SnsTopicDto[] = [];

    for (const topic of topics) {
      topicDtos.push({
        arn: topic.arn,
        name: topic.name,
        numberOfPublishes: await this.getNumberOfPublishesForTopic(topic),
      });
    }

    return topicDtos;
  }

  async createTopic(dto: SnsTopicCreateRequestDto): Promise<SnsTopicDto> {
    const existingTopic = await this.snsTopicModel.findOne({ where: { name: dto.name } });

    if (existingTopic) {
      throw new BadRequestException('Topic with same name already exists.');
    }

    const newTopic = await this.snsTopicModel.create({
      name: dto.name,
      arn: generateTopicArn({
        region: this.configService.getOrThrow('AWS_REGION'),
        userId: this.configService.getOrThrow('AWS_USER_ID'),
        name: dto.name,
      }),
    });

    return {
      arn: newTopic.arn,
      name: newTopic.name,
      numberOfPublishes: await this.getNumberOfPublishesForTopic(newTopic),
    };
  }

  async deleteTopic(arn: string): Promise<void> {
    const existingTopic = await this.snsTopicModel.findOne({ where: { arn } });

    if (!existingTopic) {
      throw new NotFoundException('Topic not found.');
    }

    await existingTopic.destroy();
  }

  async getPublishHistory(): Promise<SnsTopicPublishHistoryDto[]> {
    const publishHistory = await this.snsTopicPublishHistoryModel.findAll({
      order: [['createdAt', 'DESC']],
    });

    return publishHistory.map((e) => ({
      topicArn: e.topicArn as string,
      message: e.message as string,
      messageAttributes: e.messageAttributes,
      messageId: e.messageId,
      createdAt: e.createdAt,
    }));
  }

  async purgePublishHistory(): Promise<void> {
    await this.snsTopicPublishHistoryModel.truncate();
  }

  private async getNumberOfPublishesForTopic(topic: SnsTopic): Promise<number> {
    return await this.snsTopicPublishHistoryModel.count({ where: { topicArn: topic.arn } });
  }
}
