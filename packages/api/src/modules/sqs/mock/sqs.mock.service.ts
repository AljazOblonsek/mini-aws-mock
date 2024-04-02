import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import {
  AwsActionOptions,
  InternalFailureException,
  ValidationErrorException,
} from '@/src/common/mock';
import { SqsQueue } from '../entities/sqs-queue.entity';
import { SqsMessage } from '../entities/sqs-message.entity';
import { SqsMessageHistory } from '../entities/sqs-message-history.entity';
import { plainToInstance } from 'class-transformer';
import { CreateQueueRequestDto } from './dtos/create-queue-request.dto';
import { validate } from 'class-validator';
import { generateQueueArn } from '../utils/generate-queue-arn';
import { generateQueueUrl } from '../utils/generate-queue-url';
import { getCreateQueueResponse } from './responses/get-create-queue.response';
import { DeleteQueueRequestDto } from './dtos/delete-queue-request.dto';
import { QueueDoesNotExistException } from './exceptions/queue-does-not-exist.exception';
import { getDeleteQueueResponse } from './responses/get-delete-queue.response';
import { GetQueueUrlRequestDto } from './dtos/get-queue-url-request.dto';
import { getGetQueueUrlResponse } from './responses/get-get-queue-url.response';
import { ListQueuesRequestDto } from './dtos/list-queues-request.dto';
import { getListQueuesResponse } from './responses/get-list-queues.response';
import { SendMessageRequestDto } from './dtos/send-message-request.dto';
import { extractMessageAttributesFromSendMessageBody } from './utils/extract-message-attributes-from-send-message-body';
import { createHash, randomUUID } from 'crypto';
import { getSendMessageResponse } from './responses/get-send-message.response';
import { ReceiveMessageRequestDto } from './dtos/receive-message-request.dto';
import { extractMessageAttributeNamesFromReceiveMessageBody } from './utils/extract-message-attribute-names-from-receive-message-body';
import { getReceiveMessageResponse } from './responses/get-receive-message.response';
import { DeleteMessageRequestDto } from './dtos/delete-message-request.dto';
import { ReceiptHandleIsInvalidException } from './exceptions/receipt-handle-is-invalid.exception';
import { getDeleteMessageResponse } from './responses/get-delete-message.response';
import { SseService } from '@/src/common/core';
import { SseNotificationType } from '@mini-aws-mock/shared';

@Injectable()
export class SqsMockService {
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly sseService: SseService,
    @InjectModel(SqsQueue) private readonly sqsQueueModel: typeof SqsQueue,
    @InjectModel(SqsMessage)
    private readonly sqsMessageModel: typeof SqsMessage,
    @InjectModel(SqsMessageHistory)
    private readonly sqsMessageHistoryModel: typeof SqsMessageHistory
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  getActionsMap(): Record<string, (options: AwsActionOptions) => Promise<any>> {
    return {
      CreateQueue: this.createQueue.bind(this),
      DeleteQueue: this.deleteQueue.bind(this),
      GetQueueUrl: this.getQueueUrl.bind(this),
      ListQueues: this.listQueues.bind(this),
      SendMessage: this.sendMessage.bind(this),
      ReceiveMessage: this.receiveMessage.bind(this),
      DeleteMessage: this.deleteMessage.bind(this),
    };
  }

  private async createQueue({ requestId, body, type }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(CreateQueueRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const existingQueue = await this.sqsQueueModel.findOne({ where: { name: dto.QueueName } });

    if (existingQueue) {
      return getCreateQueueResponse({ type, requestId, queueUrl: existingQueue.url });
    }

    const newQueue = await this.sqsQueueModel.create({
      name: dto.QueueName,
      url: generateQueueUrl({
        region: this.configService.getOrThrow('AWS_REGION'),
        userId: this.configService.getOrThrow('AWS_USER_ID'),
        name: dto.QueueName,
        port: this.configService.getOrThrow('PORT'),
      }),
      arn: generateQueueArn({
        region: this.configService.getOrThrow('AWS_REGION'),
        userId: this.configService.getOrThrow('AWS_USER_ID'),
        name: dto.QueueName,
      }),
      visibilityTimeout: dto.Attributes.VisibilityTimeout,
      receiveMessageWaitTimeSeconds: dto.Attributes.ReceiveMessageWaitTimeSeconds,
      maximumMessageSize: dto.Attributes.MaximumMessageSize,
    });

    this.logger.log('[SQS] 200 - CreateQueue.');

    return getCreateQueueResponse({ type, requestId, queueUrl: newQueue.url });
  }

  private async deleteQueue({ requestId, body, type }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(DeleteQueueRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const numberOfDeletedRecords = await this.sqsQueueModel.destroy({
      where: { url: dto.QueueUrl },
    });

    if (numberOfDeletedRecords <= 0) {
      throw new QueueDoesNotExistException();
    }

    this.logger.log('[SQS] 200 - DeleteQueue.');

    return getDeleteQueueResponse({ type, requestId });
  }

  private async getQueueUrl({ requestId, body, type }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(GetQueueUrlRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const queue = await this.sqsQueueModel.findOne({ where: { name: dto.QueueName } });

    if (!queue) {
      throw new QueueDoesNotExistException();
    }

    this.logger.log('[SQS] 200 - GetQueueUrl.');

    return getGetQueueUrlResponse({ type, requestId, queueUrl: queue.url });
  }

  private async listQueues({ requestId, body, type }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(ListQueuesRequestDto, body);
    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    let queues = await this.sqsQueueModel.findAll();
    let nextToken: string | undefined;

    if (dto.QueueNamePrefix) {
      queues = queues.filter((e) => e.name.startsWith(dto.QueueNamePrefix!));
    }

    if (dto.MaxResults) {
      let startIndex = 0;

      if (dto.NextToken) {
        const topicIndex = queues.findIndex((e) => e.arn === dto.NextToken);

        if (topicIndex === -1) {
          throw new InternalFailureException();
        }

        startIndex = topicIndex;
      }

      queues = queues.slice(startIndex, startIndex + dto.MaxResults + 1);

      if (queues.length > dto.MaxResults) {
        nextToken = queues[queues.length - 1].arn;
        queues.pop();
      }
    }

    this.logger.log('[SQS] 200 - ListQueues.');

    return getListQueuesResponse({ type, requestId, queues, nextToken });
  }

  private async sendMessage({ requestId, body, type }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(SendMessageRequestDto, {
      ...body,
      MessageAttributes: extractMessageAttributesFromSendMessageBody({ type, body }),
    });

    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const queue = await this.sqsQueueModel.findOne({ where: { url: dto.QueueUrl } });

    if (!queue) {
      throw new QueueDoesNotExistException();
    }

    if (new Blob([dto.MessageBody]).size > queue.maximumMessageSize) {
      throw new ValidationErrorException('MessageBody is too big.');
    }

    const message = await this.sqsMessageModel.create({
      messageId: randomUUID(),
      messageBody: dto.MessageBody,
      md5OfMessageBody: createHash('md5').update(dto.MessageBody).digest('hex'),
      delaySeconds: dto.DelaySeconds,
      visibilityTimeout: queue.visibilityTimeout,
      messageAttributes: dto.MessageAttributes ? JSON.stringify(dto.MessageAttributes) : undefined,
      md5OfMessageAttributes: dto.MessageAttributes
        ? createHash('md5').update(JSON.stringify(dto.MessageAttributes)).digest('hex')
        : undefined,
      queueUrl: queue.url,
      createdAt: new Date(),
    });

    this.sseService.sendNotification({
      type: SseNotificationType.SqsMessageUpdate,
      payload: {
        messageId: message.messageId,
        messageBody: message.messageBody,
        messageAttributes: message.messageAttributes,
        queueUrl: message.queueUrl,
        isInTransit: !!message.receiptHandle,
        createdAt: message.createdAt,
      },
    });

    this.logger.log('[SQS] 200 - SendMessage.');

    return getSendMessageResponse({
      type,
      requestId,
      messageId: message.messageId,
      md5OfMessageBody: message.md5OfMessageBody,
      md5OfMessageAttributes: message.md5OfMessageAttributes,
    });
  }

  private async receiveMessage({ requestId, body, type, res }: AwsActionOptions) {
    const dto = plainToInstance(ReceiveMessageRequestDto, {
      ...body,
      MessageAttributeNames: extractMessageAttributeNamesFromReceiveMessageBody({ type, body }),
    });

    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const queue = await this.sqsQueueModel.findOne({ where: { url: dto.QueueUrl } });

    if (!queue) {
      throw new QueueDoesNotExistException();
    }

    const waitTimeSeconds = dto.WaitTimeSeconds || queue.receiveMessageWaitTimeSeconds;

    let requestCanceled = false;

    let availableMessages = await this.getAvailableMessagesFromQueue(queue);

    if (waitTimeSeconds > 0) {
      this.logger.debug(
        `[SQS] ReceiveMessage - Wait time in seconds is ${waitTimeSeconds} - started polling process.`
      );

      for (let i = 0; i < waitTimeSeconds; i++) {
        if (requestCanceled) {
          return;
        }

        this.logger.debug(`[SQS] ReceiveMessage - Polling for ${i + 1} seconds.`);

        availableMessages = await this.getAvailableMessagesFromQueue(queue);

        if (availableMessages.length > 0) {
          // Queue has available messages - break the loop and send them
          break;
        }

        // Wait for 1 second and try again
        await new Promise((resolve) => setTimeout(resolve, 1 * 1000));

        res.on('close', () => {
          this.logger.debug('[SQS] ReceiveMessage - Request canceled while polling.');
          requestCanceled = true;
        });
      }
    }

    if (requestCanceled) {
      return;
    }

    if (availableMessages.length <= 0) {
      this.logger.log('[SQS] 200 - ReceiveMessage. Info: No messages found.');
      return getReceiveMessageResponse({ type, requestId });
    }

    const visibilityTimeout = dto.VisibilityTimeout || queue.visibilityTimeout;

    const messagesToReceive: SqsMessage[] = [];

    for (const message of availableMessages) {
      if (messagesToReceive.length >= dto.MaxNumberOfMessages) {
        break;
      }

      message.receiptHandle = randomUUID();
      message.receiptHandleSentAt = new Date();
      message.visibilityTimeout = visibilityTimeout;
      await message.save();

      this.sseService.sendNotification({
        type: SseNotificationType.SqsMessageUpdate,
        payload: {
          messageId: message.messageId,
          messageBody: message.messageBody,
          messageAttributes: message.messageAttributes,
          queueUrl: message.queueUrl,
          isInTransit: !!message.receiptHandle,
          createdAt: message.createdAt,
        },
      });

      messagesToReceive.push(message);
    }

    this.logger.log('[SQS] 200 - ReceiveMessage. Info: Found messages.');
    this.logger.debug(
      { messages: messagesToReceive },
      '[SQS] 200 - ReceiveMessage. Info: found messages.'
    );

    return getReceiveMessageResponse({
      type,
      requestId,
      messages: messagesToReceive,
      messageAttributeNames: dto.MessageAttributeNames,
    });
  }

  private async deleteMessage({ requestId, body, type }: AwsActionOptions): Promise<any> {
    const dto = plainToInstance(DeleteMessageRequestDto, body);

    const validationResult = await validate(dto);

    if (validationResult.length > 0) {
      throw new ValidationErrorException();
    }

    const queue = await this.sqsQueueModel.findOne({ where: { url: dto.QueueUrl } });

    if (!queue) {
      throw new QueueDoesNotExistException();
    }

    const message = await this.sqsMessageModel.findOne({
      where: {
        queueUrl: queue.url,
        receiptHandle: dto.ReceiptHandle,
      },
    });

    if (!message) {
      throw new ReceiptHandleIsInvalidException();
    }

    const numberOfDeletedRecords = await this.sqsMessageModel.destroy({
      where: { queueUrl: queue.url, receiptHandle: dto.ReceiptHandle },
    });

    if (numberOfDeletedRecords <= 0) {
      throw new InternalFailureException(
        'An unknown error occurred while trying to delete message.'
      );
    }

    await this.sqsMessageHistoryModel.create({
      messageId: message.messageId,
      messageBody: message.messageBody,
      md5OfMessageBody: message.md5OfMessageBody,
      delaySeconds: message.delaySeconds,
      visibilityTimeout: message.visibilityTimeout,
      messageAttributes: message.messageAttributes,
      md5OfMessageAttributes: message.md5OfMessageAttributes,
      queueUrl: message.queueUrl,
      receiptHandle: message.receiptHandle,
      receiptHandleSentAt: message.receiptHandleSentAt,
      createdAt: message.createdAt,
      deletedAt: new Date(),
    });

    this.logger.log('[SQS] 200 - DeleteMessage.');

    return getDeleteMessageResponse({ type, requestId });
  }

  private async getAvailableMessagesFromQueue(sqsQueue: SqsQueue): Promise<SqsMessage[]> {
    const availableSqsMessages: SqsMessage[] = [];

    const sqsMessages = await this.sqsMessageModel.findAll({
      order: [['createdAt', 'ASC']],
      where: {
        queueUrl: sqsQueue.url,
        receiptHandle: null,
      },
    });

    for (const sqsMessage of sqsMessages) {
      if (sqsMessage.delaySeconds) {
        const messageAvailableToProcessAt = new Date(
          sqsMessage.createdAt.getTime() + sqsMessage.delaySeconds * 1000
        );

        const now = new Date();

        // Message is not ready to be processed yet.
        if (messageAvailableToProcessAt > now) {
          continue;
        }
      }

      availableSqsMessages.push(sqsMessage);
    }

    return availableSqsMessages;
  }
}
