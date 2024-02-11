import { ValidationErrorException } from '@/common/exceptions';
import { createTopicSchema } from '../schemas/create-topic.schema';
import { Request, Response } from 'express';
import { generateTopicArn } from '../utils/generate-topic-arn';
import { env, logger, unflattenBody } from '@/core';
import { getCreateTopicResponse } from '../responses/get-create-topic-response';
import { snsTopicDb } from '../dbs/sns-topic.db';

export const createTopic = (req: Request, res: Response) => {
  const body = createTopicSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  res.header('Content-Type', 'application/xml');

  const existingTopic = snsTopicDb.getFirstByKeyValue({ key: 'name', value: body.data.Name });

  if (existingTopic) {
    return res.status(200).send(
      getCreateTopicResponse({
        requestId: req.headers['x-amzn-requestid'] as string,
        topicArn: existingTopic.arn,
      })
    );
  }

  const newTopic = snsTopicDb.create({
    name: body.data.Name,
    arn: generateTopicArn({
      region: env.AWS_REGION,
      userId: env.AWS_USER_ID,
      name: body.data.Name,
    }),
  });

  logger.info('[SNS] 200 - CreateTopic.');

  return res.status(200).send(
    getCreateTopicResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
      topicArn: newTopic.arn,
    })
  );
};
