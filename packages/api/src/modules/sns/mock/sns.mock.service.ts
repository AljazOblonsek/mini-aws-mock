import { Injectable, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTopicRequestDto } from './dtos/create-topic-request.dto';
import { InjectModel } from '@nestjs/sequelize';
import { SnsTopic } from '../entities/sns-topic.entity';
import { generateTopicArn } from '../utils/generate-topic-arn';
import { ConfigService } from '@nestjs/config';
import { getCreateTopicXmlResponse } from './responses/create-topic.response';
import { DeleteTopicRequestDto } from './dtos/delete-topic-request.dto';
import { TopicNotFoundException } from './exceptions/topic-not-found.exception';
import { getDeleteTopicXmlResponse } from './responses/delete-topic.response';
import { getListTopicsXmlResponse } from './responses/list-topics.response';
import { PublishRequestDto } from './dtos/publish-request.dto';
import { extractMessageAttributesFromPublishBody } from './utils/extract-message-attributes-from-publish-body';
import { randomUUID } from 'crypto';
import { SnsTopicPublishHistory } from '../entities/sns-topic-publish-history.entity';
import { getPublishXmlResponse } from './responses/publish.response';
import {
  ValidationErrorException,
  AwsActionOptions,
  AwsListRequestDto,
  InternalFailureException,
} from '@/src/common/mock';
import { SseService } from '@/src/common/core';
import { SseNotificationType } from '@mini-aws-mock/shared';

@Injectable()
export class SnsMockService {
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly sseService: SseService,
    @InjectModel(SnsTopic) private readonly snsTopicModel: typeof SnsTopic,
    @InjectModel(SnsTopicPublishHistory)
    private readonly snsTopicPublishHistoryModel: typeof SnsTopicPublishHistory
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  getActionsMap(): Record<string, (options: AwsActionOptions) => Promise<any>> {
    return {
      CreateTopic: this.createTopic.bind(this),
      DeleteTopic: this.deleteTopic.bind(this),
      ListTopics: this.listTopics.bind(this),
      Publish: this.publish.bind(this),
    };
  }

  private async createTopic({ requestId, body }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(CreateTopicRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const existingTopic = await this.snsTopicModel.findOne({ where: { name: dto.Name } });

    if (existingTopic) {
      return getCreateTopicXmlResponse({ topicArn: existingTopic.arn, requestId });
    }

    const newTopic = await this.snsTopicModel.create({
      name: dto.Name,
      arn: generateTopicArn({
        region: this.configService.getOrThrow('AWS_REGION'),
        userId: this.configService.getOrThrow('AWS_USER_ID'),
        name: dto.Name,
      }),
    });

    this.logger.log('[SNS] 200 - CreateTopic.');

    return getCreateTopicXmlResponse({ topicArn: newTopic.arn, requestId });
  }

  private async deleteTopic({ requestId, body }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(DeleteTopicRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const topic = await this.snsTopicModel.findOne({ where: { arn: dto.TopicArn } });

    if (!topic) {
      throw new TopicNotFoundException();
    }

    await topic.destroy();

    this.logger.log('[SNS] 200 - DeleteTopic.');

    return getDeleteTopicXmlResponse({ requestId });
  }

  private async listTopics({ requestId, body }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(AwsListRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    let topics = await this.snsTopicModel.findAll();
    let nextToken: string | undefined;

    const listResponseSize =
      Number(this.configService.get('LIST_RESPONSE_SIZE', undefined)) || undefined;

    if (listResponseSize) {
      let startIndex = 0;

      if (dto.NextToken) {
        const topicIndex = topics.findIndex((e) => e.arn === dto.NextToken);

        if (topicIndex === -1) {
          throw new InternalFailureException();
        }

        startIndex = topicIndex;
      }

      topics = topics.slice(startIndex, startIndex + listResponseSize + 1);

      if (topics.length > listResponseSize) {
        nextToken = topics[topics.length - 1].arn;
        topics.pop();
      }
    }

    this.logger.log('[SNS] 200 - ListTopics.');

    return getListTopicsXmlResponse({ requestId, topics, nextToken });
  }

  private async publish({ requestId, body }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(PublishRequestDto, {
      ...body,
      MessageAttributes: extractMessageAttributesFromPublishBody(body),
    });
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    if (!dto.TopicArn) {
      throw new ValidationErrorException();
    }

    const topic = await this.snsTopicModel.findOne({ where: { arn: dto.TopicArn } });

    if (!topic) {
      throw new TopicNotFoundException();
    }

    const messageId = randomUUID();

    const snsPublishHistory = await this.snsTopicPublishHistoryModel.create({
      messageId,
      createdAt: new Date(),
      message: dto.Message,
      messageAttributes: JSON.stringify(dto.MessageAttributes),
      messageDeduplicationId: dto.MessageDeduplicationId,
      messageGroupId: dto.MessageGroupId,
      messageStructure: dto.MessageStructure,
      phoneNumber: dto.PhoneNumber,
      subject: dto.Subject,
      targetArn: dto.TargetArn,
      topicArn: dto.TopicArn,
    });

    this.sseService.sendNotification({
      type: SseNotificationType.SnsPublish,
      payload: {
        topicArn: snsPublishHistory.topicArn as string,
        message: snsPublishHistory.message as string,
        messageAttributes: snsPublishHistory.messageAttributes,
        messageId: snsPublishHistory.messageId,
        createdAt: snsPublishHistory.createdAt,
      },
    });

    this.logger.log({ data: snsPublishHistory }, `[SNS] 200 - Publish, MessageId: ${messageId}.`);

    return getPublishXmlResponse({ requestId, messageId });
  }
}
