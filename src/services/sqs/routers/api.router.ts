import { Request, Response, Router } from 'express';
import { env } from '@/core';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { createQueueSchema } from '../schemas/create-queue.schema';
import { generateQueueArn } from '../utils/generate-queue-url';
import { generateQueueUrl } from '../utils/generate-queue-arn';
import { sqsMessageDb } from '../dbs/sqs-message.db';
import { sqsMessageHistoryDb } from '../dbs/sqs-message-history.db';

const apiRouter = Router();

apiRouter.post('/api/sqs-queues/', (req: Request, res: Response) => {
  const body = createQueueSchema.safeParse({
    QueueName: req.body.queueName,
    Attributes: {
      VisibilityTimeout: req.body.visibilityTimeout,
      ReceiveMessageWaitTimeSeconds: req.body.receiveMessageWaitTimeSeconds,
      MaximumMessageSize: req.body.maximumMessageSize,
    },
  });

  if (!body.success) {
    return res.status(400).send({ error: `Invalid request body: ${body.error.message}.` });
  }

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'name', value: body.data.QueueName });

  if (queue) {
    return res.status(409).send({ error: 'Queue with same name already exists.' });
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

  return res.status(201).send(newQueue);
});

apiRouter.patch('/api/sqs-queues/:queueUrl/purge', (req: Request, res: Response) => {
  const { queueUrl } = req.params;

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'url', value: queueUrl });

  if (!queue) {
    return res.status(404).send({ error: 'Queue not found.' });
  }

  sqsMessageDb.deleteByKeyValue({ key: 'queueUrl', value: queueUrl });

  return res.status(204).send();
});

apiRouter.delete('/api/sqs-queues/:queueUrl', (req: Request, res: Response) => {
  const { queueUrl } = req.params;

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'url', value: queueUrl });

  if (!queue) {
    return res.status(404).send({ error: 'Queue not found.' });
  }

  sqsQueueDb.deleteByKeyValue({ key: 'url', value: queueUrl });
  sqsMessageDb.deleteByKeyValue({ key: 'queueUrl', value: queueUrl });
  sqsMessageHistoryDb.deleteByKeyValue({ key: 'queueUrl', value: queueUrl });

  return res.status(204).send();
});

export { apiRouter };
