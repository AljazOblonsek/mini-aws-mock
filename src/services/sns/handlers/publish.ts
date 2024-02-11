import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { TopicNotFoundException } from '../exceptions/topic-not-found.exception';
import { publishSchema } from '../schemas/publish.schema';
import { ValidationErrorException } from '@/common/exceptions';
import { getPublishResponse } from '../responses/get-publish-response';
import { snsTopicDb } from '../dbs/sns-topic.db';
import { snsTopicPublicHistoryDb } from '../dbs/sns-topic-publish-history.db';
import { logger, sseManager, unflattenBody } from '@/core';
import { transformSnsTopicPublishHistoryToDto } from '../dtos/sns-topic-publish-history.dto';

export const publish = (req: Request, res: Response) => {
  const body = publishSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  if (!body.data.TopicArn) {
    throw new ValidationErrorException();
  }

  const topic = snsTopicDb.getFirstByKeyValue({ key: 'arn', value: body.data.TopicArn });

  if (!topic) {
    throw new TopicNotFoundException();
  }

  const messageId = randomUUID();

  const snsTopicPublishHistory = snsTopicPublicHistoryDb.create({
    ...body.data,
    CreatedAt: new Date().toISOString(),
    MessageId: messageId,
  });

  sseManager.sendNotificationToAll({
    type: 'SNS.Publish',
    payload: transformSnsTopicPublishHistoryToDto(snsTopicPublishHistory),
  });

  logger.info({ data: body.data }, `[SNS] 200 - Publish, MessageId: ${messageId}.`);

  res.header('Content-Type', 'application/xml');

  return res
    .status(200)
    .send(getPublishResponse({ requestId: req.headers['x-amzn-requestid'] as string, messageId }));
};
