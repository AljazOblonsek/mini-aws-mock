import { ValidationErrorException } from '@/common/exceptions';
import { Request, Response } from 'express';
import { logger, unflattenBody } from '@/core';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { QueueDoesNotExistException } from '../exceptions/queues-does-not-exist.exception';
import { getGetQueueUrlResponse } from '../responses/get-get-queue-url-response';
import { getQueueUrlSchema } from '../schemas/get-queue-url.schema';

export const getQueueUrl = (req: Request, res: Response) => {
  const body = getQueueUrlSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  res.header('Content-Type', 'application/xml');

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'name', value: body.data.QueueName });

  if (!queue) {
    throw new QueueDoesNotExistException();
  }

  logger.info('[SQS] 200 - GetQueueUrl.');

  return res.status(200).send(
    getGetQueueUrlResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
      queueUrl: queue.url,
    })
  );
};
