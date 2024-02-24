import { InternalFailureException, ValidationErrorException } from '@/common/exceptions';
import { Request, Response } from 'express';
import { logger, unflattenBody } from '@/core';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { QueueDoesNotExistException } from '../exceptions/queues-does-not-exist.exception';
import { deleteMessageSchema } from '../schemas/delete-message.schema';
import { sqsMessageDb } from '../dbs/sqs-message.db';
import { ReceiptHandleIsInvalidException } from '../exceptions/receipt-handle-is-invalid.exception';
import { sqsMessageHistoryDb } from '../dbs/sqs-message-history.db';
import { getDeleteMessageResponse } from '../responses/get-delete-message-response';

export const deleteMessage = (req: Request, res: Response) => {
  const body = deleteMessageSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  res.header('Content-Type', 'application/xml');

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'url', value: body.data.QueueUrl });

  if (!queue) {
    throw new QueueDoesNotExistException();
  }

  const message = sqsMessageDb.getFirstByKeyValue({
    key: 'receiptHandle',
    value: body.data.ReceiptHandle,
  });

  if (!message) {
    throw new ReceiptHandleIsInvalidException();
  }

  const numberOfDeletedMessages = sqsMessageDb.deleteByKeyValue({
    key: 'receiptHandle',
    value: body.data.ReceiptHandle,
  });

  if (numberOfDeletedMessages <= 0) {
    throw new InternalFailureException('An unknown error occurred while trying to delete message.');
  }

  sqsMessageHistoryDb.create({ ...message, deletedAt: new Date() });

  logger.info('[SQS] 200 - DeleteMessage.');

  return res.status(200).send(
    getDeleteMessageResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
    })
  );
};
