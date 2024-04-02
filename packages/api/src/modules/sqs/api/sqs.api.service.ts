import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { SqsQueue } from '../entities/sqs-queue.entity';
import { SqsMessage } from '../entities/sqs-message.entity';
import { SqsMessageHistory } from '../entities/sqs-message-history.entity';
import {
  SqsMessageDto,
  SqsMessageHistoryDto,
  SqsQueueCreateRequestDto,
  SqsQueueDto,
  SqsSendMessageRequestDto,
} from '@mini-aws-mock/shared';
import { generateQueueUrl } from '../utils/generate-queue-url';
import { generateQueueArn } from '../utils/generate-queue-arn';
import { createHash, randomUUID } from 'crypto';

@Injectable()
export class SqsApiService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SqsQueue) private readonly sqsQueueModel: typeof SqsQueue,
    @InjectModel(SqsMessage) private readonly sqsMessageModel: typeof SqsMessage,
    @InjectModel(SqsMessageHistory)
    private readonly sqsMessageHistoryModel: typeof SqsMessageHistory
  ) {}

  async getQueues(): Promise<SqsQueueDto[]> {
    const queues = await this.sqsQueueModel.findAll();

    const queueDtos: SqsQueueDto[] = [];

    for (const queue of queues) {
      queueDtos.push({
        arn: queue.arn,
        name: queue.name,
        url: queue.url,
        visibilityTimeout: queue.visibilityTimeout,
        receiveMessageWaitTimeSeconds: queue.receiveMessageWaitTimeSeconds,
        maximumMessageSize: queue.maximumMessageSize,
        numberOfMessages: await this.getNumberOfMessagesInQueue(queue),
        numberOfMessagesInHistory: await this.getNumberOfMessagesInQueueHistory(queue),
      });
    }

    return queueDtos;
  }

  async createQueue(dto: SqsQueueCreateRequestDto): Promise<SqsQueueDto> {
    const existingQueue = await this.sqsQueueModel.findOne({ where: { name: dto.name } });

    if (existingQueue) {
      throw new BadRequestException('Queue with same name already exists.');
    }

    const newQueue = await this.sqsQueueModel.create({
      name: dto.name,
      url: generateQueueUrl({
        region: this.configService.getOrThrow('AWS_REGION'),
        userId: this.configService.getOrThrow('AWS_USER_ID'),
        name: dto.name,
        port: this.configService.getOrThrow('PORT'),
      }),
      arn: generateQueueArn({
        region: this.configService.getOrThrow('AWS_REGION'),
        userId: this.configService.getOrThrow('AWS_USER_ID'),
        name: dto.name,
      }),
      visibilityTimeout: dto.visibilityTimeout,
      receiveMessageWaitTimeSeconds: dto.receiveMessageWaitTimeSeconds,
      maximumMessageSize: dto.maximumMessageSize,
    });

    return {
      arn: newQueue.arn,
      name: newQueue.name,
      url: newQueue.url,
      visibilityTimeout: newQueue.visibilityTimeout,
      receiveMessageWaitTimeSeconds: newQueue.receiveMessageWaitTimeSeconds,
      maximumMessageSize: newQueue.maximumMessageSize,
      numberOfMessages: await this.getNumberOfMessagesInQueue(newQueue),
      numberOfMessagesInHistory: await this.getNumberOfMessagesInQueueHistory(newQueue),
    };
  }

  async sendMessage(dto: SqsSendMessageRequestDto): Promise<SqsMessageDto> {
    const queue = await this.sqsQueueModel.findOne({ where: { url: dto.queueUrl } });

    if (!queue) {
      throw new NotFoundException('Queue not found.');
    }

    const messageAttributes = dto.messageAttributes.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.name]: { DataType: 'String', StringValue: currentValue.value },
      };
    }, {});

    const message = await this.sqsMessageModel.create({
      messageId: randomUUID(),
      messageBody: dto.messageBody,
      md5OfMessageBody: createHash('md5').update(dto.messageBody).digest('hex'),
      delaySeconds: dto.delaySeconds,
      visibilityTimeout: queue.visibilityTimeout,
      messageAttributes: messageAttributes ? JSON.stringify(messageAttributes) : undefined,
      md5OfMessageAttributes: messageAttributes
        ? createHash('md5').update(JSON.stringify(messageAttributes)).digest('hex')
        : undefined,
      queueUrl: queue.url,
      createdAt: new Date(),
    });

    return {
      messageId: message.messageId,
      messageBody: message.messageBody,
      messageAttributes: message.messageAttributes,
      queueUrl: message.queueUrl,
      isInTransit: !!message.receiptHandle,
      createdAt: message.createdAt,
    };
  }

  async purgeQueue(name: string): Promise<void> {
    const queue = await this.sqsQueueModel.findOne({ where: { name } });

    if (!queue) {
      throw new NotFoundException('Queue not found.');
    }

    await this.sqsMessageModel.destroy({ where: { queueUrl: queue.url } });
  }

  async deleteQueue(name: string): Promise<void> {
    const queue = await this.sqsQueueModel.findOne({ where: { name } });

    if (!queue) {
      throw new NotFoundException('Queue not found.');
    }

    await this.sqsMessageModel.destroy({ where: { queueUrl: queue.url } });
    await this.sqsMessageHistoryModel.destroy({ where: { queueUrl: queue.url } });
    await queue.destroy();
  }

  async getMessages(): Promise<SqsMessageDto[]> {
    const messages = await this.sqsMessageModel.findAll({ order: [['createdAt', 'DESC']] });

    const messageDtos: SqsMessageDto[] = messages.map((e) => ({
      messageId: e.messageId,
      messageBody: e.messageBody,
      messageAttributes: e.messageAttributes,
      queueUrl: e.queueUrl,
      isInTransit: !!e.receiptHandle,
      createdAt: e.createdAt,
    }));

    return messageDtos;
  }

  async getMessageHistory(): Promise<SqsMessageHistoryDto[]> {
    const messageHistory = await this.sqsMessageHistoryModel.findAll({
      order: [['deletedAt', 'DESC']],
    });

    const messageHistoryDtos: SqsMessageHistoryDto[] = messageHistory.map((e) => ({
      messageId: e.messageId,
      messageBody: e.messageBody,
      messageAttributes: e.messageAttributes,
      queueUrl: e.queueUrl,
      isInTransit: !!e.receiptHandle,
      createdAt: e.createdAt,
      deletedAt: e.deletedAt,
    }));

    return messageHistoryDtos;
  }

  private async getNumberOfMessagesInQueue(queue: SqsQueue): Promise<number> {
    return await this.sqsMessageModel.count({ where: { queueUrl: queue.url } });
  }

  private async getNumberOfMessagesInQueueHistory(queue: SqsQueue): Promise<number> {
    return await this.sqsMessageHistoryModel.count({ where: { queueUrl: queue.url } });
  }
}
