import { ValidationErrorException } from '@/common/exceptions';
import { Request, Response } from 'express';
import { env, logger, unflattenBody } from '@/core';
import { createQueueSchema } from '../schemas/create-queue.schema';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { getCreateQueueResponse } from '../responses/get-create-queue-response';
import { generateQueueArn } from '../utils/generate-queue-url';
import { generateQueueUrl } from '../utils/generate-queue-arn';

export const createQueue = (req: Request, res: Response) => {
  const body = createQueueSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  res.header('Content-Type', 'application/xml');

  const existingQueue = sqsQueueDb.getFirstByKeyValue({ key: 'name', value: body.data.QueueName });

  if (existingQueue) {
    return res.status(200).send(
      getCreateQueueResponse({
        requestId: req.headers['x-amzn-requestid'] as string,
        queueUrl: existingQueue.url,
      })
    );
  }

  const newQueue = sqsQueueDb.create({
    name: body.data.QueueName,
    url: generateQueueUrl({
      region: env.AWS_REGION,
      userId: env.AWS_USER_ID,
      name: body.data.QueueName,
      port: env.PORT,
    }),
    arn: generateQueueArn({
      region: env.AWS_REGION,
      userId: env.AWS_USER_ID,
      name: body.data.QueueName,
    }),
    visibilityTimeout: body.data.Attributes.VisibilityTimeout,
    receiveMessageWaitTimeSeconds: body.data.Attributes.ReceiveMessageWaitTimeSeconds,
    maximumMessageSize: body.data.Attributes.MaximumMessageSize,
  });

  logger.info('[SQS] 200 - CreateQueue.');

  return res.status(200).send(
    getCreateQueueResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
      queueUrl: newQueue.url,
    })
  );
};
