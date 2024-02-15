import { Request, Response } from 'express';
import { InternalFailureException, ValidationErrorException } from '@/common/exceptions';
import { env, logger, unflattenBody } from '@/core';
import { listQueuesSchema } from '../schemas/list-queues.schema';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { getListQueuesResponse } from '../responses/get-list-queues-response';

export const listQueues = (req: Request, res: Response) => {
  const body = listQueuesSchema.safeParse(unflattenBody(req.body));

  if (!body.success) {
    throw new ValidationErrorException();
  }

  let queues = sqsQueueDb.getAll() || [];
  let nextToken: string | undefined = undefined;

  if (body.data.QueueNamePrefix) {
    queues = queues.filter((e) => e.name.startsWith(body.data.QueueNamePrefix!));
  }

  if (body.data.MaxResults) {
    let startIndex = 0;

    if (body.data.NextToken) {
      const topicIndex = queues.findIndex((e) => e.arn === body.data.NextToken);

      if (topicIndex === -1) {
        throw new InternalFailureException();
      }

      startIndex = topicIndex;
    }

    queues = queues.slice(startIndex, startIndex + body.data.MaxResults + 1);

    if (queues.length > body.data.MaxResults) {
      nextToken = queues[queues.length - 1].arn;
      queues.pop();
    }
  }

  logger.info('[SNS] 200 - ListQueues.');

  res.header('Content-Type', 'application/xml');

  return res.status(200).send(
    getListQueuesResponse({
      requestId: req.headers['x-amzn-requestid'] as string,
      queues,
      nextToken,
    })
  );
};
