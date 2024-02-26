import { ValidationErrorException } from '@/common/exceptions';
import { Request, Response } from 'express';
import { logger, unflattenBody } from '@/core';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { deleteQueueSchema } from '../schemas/delete-queue.schema';
import { QueueDoesNotExistException } from '../exceptions/queues-does-not-exist.exception';
import { getDeleteQueueResponse } from '../responses/get-delete-queue-response';

export const deleteQueue = (req: Request, res: Response) => {
  const body = deleteQueueSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  res.header('Content-Type', 'application/xml');

  const numberOfDeletedRecords = sqsQueueDb.deleteByKeyValue({
    key: 'url',
    value: body.data.QueueUrl,
  });

  if (numberOfDeletedRecords <= 0) {
    throw new QueueDoesNotExistException();
  }

  logger.info('[SQS] 200 - DeleteQueue.');

  return res.status(200).send(
    getDeleteQueueResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
    })
  );
};
