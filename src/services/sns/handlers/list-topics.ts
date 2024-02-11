import { Request, Response } from 'express';
import { listTopicsSchema } from '../schemas/list-topics.schema';
import { InternalFailureException, ValidationErrorException } from '@/common/exceptions';
import { getListTopicsResponse } from '../responses/get-list-topics-response';
import { env, logger, unflattenBody } from '@/core';
import { snsTopicDb } from '../dbs/sns-topic.db';

export const listTopics = (req: Request, res: Response) => {
  const body = listTopicsSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  let topics = snsTopicDb.getAll() || [];
  let nextToken: string | undefined = undefined;

  if (env.LIST_RESPONSE_SIZE) {
    let startIndex = 0;

    if (body.data.NextToken) {
      const topicIndex = topics.findIndex((e) => e.arn === body.data.NextToken);

      if (topicIndex === -1) {
        throw new InternalFailureException();
      }

      startIndex = topicIndex;
    }

    topics = topics.slice(startIndex, startIndex + env.LIST_RESPONSE_SIZE + 1);

    if (topics.length > env.LIST_RESPONSE_SIZE) {
      nextToken = topics[topics.length - 1].arn;
      topics.pop();
    }
  }

  logger.info('[SNS] 200 - ListTopics.');

  res.header('Content-Type', 'application/xml');

  return res.status(200).send(
    getListTopicsResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
      topics: topics,
      nextToken,
    })
  );
};
