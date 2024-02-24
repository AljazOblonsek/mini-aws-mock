import { ValidationErrorException } from '@/common/exceptions';
import { Request, Response } from 'express';
import { logger } from '@/core';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { QueueDoesNotExistException } from '../exceptions/queues-does-not-exist.exception';
import { receiveMessageSchema } from '../schemas/receive-message.schema';
import { SqsQueue } from '../types/sqs-queue.type';
import { sqsMessageDb } from '../dbs/sqs-message.db';
import { getReceiveMessageResponse } from '../responses/get-receive-message-response';
import { SqsMessage } from '../types/sqs-message.type';
import { randomUUID } from 'crypto';

const extractMessageAttributeNamesFromObject = (
  object: Record<string, unknown>
): string[] | undefined => {
  const messageAttributeNames: string[] = [];

  for (let i = 1; i <= 50; i++) {
    const name = object[`MessageAttributeName.${i}`];

    if (!name) {
      break;
    }

    messageAttributeNames.push(name as string);
  }

  if (messageAttributeNames.length <= 0) {
    return undefined;
  }

  return messageAttributeNames;
};

const getAvailableMessagesFromQueue = (queue: SqsQueue): SqsMessage[] => {
  const availableMessages: SqsMessage[] = [];

  const messages = (
    sqsMessageDb.getAllByKeyValue({ key: 'queueUrl', value: queue.url }) || []
  ).sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf());

  for (const message of messages) {
    if (message.delaySeconds) {
      const messageAvailableToProcessAt = new Date(
        message.createdAt.getTime() + message.delaySeconds * 1000
      );

      const now = new Date();

      // Message is not ready to be processed yet.
      if (messageAvailableToProcessAt > now) {
        continue;
      }
    }

    if (message.receiptHandle) {
      continue;
    }

    availableMessages.push(message);
  }

  return availableMessages;
};

export const receiveMessage = (req: Request, res: Response) => {
  const body = receiveMessageSchema.safeParse({
    ...req.body,
    MessageAttributeNames: extractMessageAttributeNamesFromObject(req.body),
  });

  if (!body.success) {
    throw new ValidationErrorException();
  }

  res.header('Content-Type', 'application/xml');

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'url', value: body.data.QueueUrl });

  if (!queue) {
    throw new QueueDoesNotExistException();
  }

  const waitTimeSeconds = body.data.WaitTimeSeconds || queue.receiveMessageWaitTimeSeconds;

  let availableMessages = getAvailableMessagesFromQueue(queue);

  if (waitTimeSeconds > 0) {
    logger.debug(
      `[SQS] ReceiveMessage - Wait time in seconds is ${waitTimeSeconds} - started polling process.`
    );

    for (let i = 0; i < waitTimeSeconds; i++) {
      logger.debug(`[SQS] ReceiveMessage - Polling for ${i + 1} seconds.`);

      availableMessages = getAvailableMessagesFromQueue(queue);

      if (availableMessages.length > 0) {
        // Queue has available messages - break the loop and send them
        break;
      }

      // Wait for 1 second and try again
      // await new Promise((resolve) => setTimeout(resolve, (i + 1) * 1000));
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, (i + 1) * 1000);

      req.on('close', () => {
        logger.debug('[SQS] ReceiveMessage - Request canceled while polling.');
        return;
      });
    }
  }

  if (availableMessages.length <= 0) {
    logger.info('[SQS] 200 - ReceiveMessage. Info: No messages found.');
    return res.status(200).send(
      getReceiveMessageResponse({
        requestId: req.headers['x-amzn-requestid'] as string,
      })
    );
  }

  const visibilityTimeout = body.data.VisibilityTimeout || queue.visibilityTimeout;

  const messagesToReceive: SqsMessage[] = [];

  for (const message of availableMessages) {
    if (messagesToReceive.length >= body.data.MaxNumberOfMessages) {
      break;
    }

    const updatedMessage = sqsMessageDb.updateFirstByKeyValue({
      key: 'messageId',
      value: message.messageId,
      data: { receiptHandle: randomUUID(), receiptHandleSentAt: new Date(), visibilityTimeout },
    });

    if (!updatedMessage) {
      logger.error({ message, body: body.data }, 'Could not prepare message to be received.');
      continue;
    }

    messagesToReceive.push(updatedMessage);
  }

  logger.info('[SQS] 200 - ReceiveMessage. Info: Found messages.');
  logger.debug(
    { messages: messagesToReceive },
    '[SQS] 200 - ReceiveMessage. Info: found messages.'
  );

  return res.status(200).send(
    getReceiveMessageResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
      messages: messagesToReceive,
      messageAttributeNames: body.data.MessageAttributeNames,
    })
  );
};
