import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { SqsMessage } from '../entities/sqs-message.entity';
import { Op } from 'sequelize';
import { SseService } from '@/src/common/core';
import { SseNotificationType } from '@mini-aws-mock/shared';

@Injectable()
export class SqsMockCronService {
  private readonly logger: Logger;

  constructor(
    private readonly sseService: SseService,
    @InjectModel(SqsMessage)
    private readonly sqsMessageModel: typeof SqsMessage
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async refreshSqsMessageVisibilityJob(): Promise<void> {
    this.logger.verbose('Running refresh sqs message visibility job.');

    const messages = await this.sqsMessageModel.findAll({
      where: {
        receiptHandle: {
          [Op.not]: null,
        },
      },
    });

    this.logger.verbose({ messages }, `Found ${messages.length} invisible messages.`);

    for (const message of messages) {
      if (!message.receiptHandleSentAt) {
        this.logger.verbose(
          { message },
          'Found a message with receipt handle but no sent at date.'
        );
        continue;
      }

      const now = new Date();

      if (
        new Date(
          new Date(message.receiptHandleSentAt).getTime() + message.visibilityTimeout * 1000
        ) > now
      ) {
        this.logger.verbose({ message }, 'Message is not ready yet to be set to visible.');
        continue;
      }

      message.receiptHandle = null!;
      message.receiptHandleSentAt = null!;
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

      this.logger.verbose({ message }, 'Successfully set message back to visible.');
    }
  }
}
