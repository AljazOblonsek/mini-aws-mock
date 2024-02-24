import { ValidationErrorException } from '@/common/exceptions';
import { Request, Response } from 'express';
import { logger } from '@/core';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { sendMessageSchema } from '../schemas/send-message.schema';
import { QueueDoesNotExistException } from '../exceptions/queues-does-not-exist.exception';
import { sqsMessageDb } from '../dbs/sqs-message.db';
import { createHash, randomUUID } from 'crypto';
import { getSendMessageResponse } from '../responses/get-send-message-response';
import { extractMessageAttributesFromObject } from '@/common';

export const sendMessage = (req: Request, res: Response) => {
  const body = sendMessageSchema.safeParse({
    ...req.body,
    MessageAttributes: extractMessageAttributesFromObject({
      prefix: 'MessageAttribute',
      object: req.body,
    }),
  });

  if (!body.success) {
    throw new ValidationErrorException();
  }

  res.header('Content-Type', 'application/xml');

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'url', value: body.data.QueueUrl });

  if (!queue) {
    throw new QueueDoesNotExistException();
  }

  const message = sqsMessageDb.create({
    messageId: randomUUID(),
    messageBody: body.data.MessageBody,
    md5OfMessageBody: createHash('md5').update(body.data.MessageBody).digest('hex'),
    delaySeconds: body.data.DelaySeconds,
    visibilityTimeout: queue.visibilityTimeout,
    messageAttributes:
      body.data.MessageAttributes?.map((e) => ({
        name: e.Name,
        value: {
          dataType: e.Value.DataType,
          stringValue: e.Value.StringValue,
          binaryValue: e.Value.BinaryValue,
        },
      })) || [],
    md5OfMessageAttributes: body.data.MessageAttributes
      ? createHash('md5').update(JSON.stringify(body.data.MessageAttributes)).digest('hex')
      : undefined,
    queueUrl: queue.url,
    createdAt: new Date(),
  });

  logger.info('[SQS] 200 - SendMessage.');

  return res.status(200).send(
    getSendMessageResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
      messageId: message.messageId,
      md5OfMessageBody: message.md5OfMessageBody,
      md5OfMessageAttributes: message.md5OfMessageAttributes,
    })
  );
};
