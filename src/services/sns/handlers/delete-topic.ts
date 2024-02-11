import { ValidationErrorException } from '@/common/exceptions';
import { Request, Response } from 'express';
import { deleteTopicSchema } from '../schemas/delete-topic.schema';
import { TopicNotFoundException } from '../exceptions/topic-not-found.exception';
import { getDeleteTopicResponse } from '../responses/get-delete-topic-response';
import { snsTopicDb } from '../dbs/sns-topic.db';
import { logger, unflattenBody } from '@/core';

export const deleteTopic = (req: Request, res: Response) => {
  const body = deleteTopicSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  const numberOfDeletedRecords = snsTopicDb.deleteByKeyValue({
    key: 'arn',
    value: body.data.TopicArn,
  });

  if (numberOfDeletedRecords <= 0) {
    throw new TopicNotFoundException();
  }

  logger.info('[SNS] 200 - DeleteTopic.');

  res.header('Content-Type', 'application/xml');

  return res.status(200).send(
    getDeleteTopicResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
    })
  );
};
