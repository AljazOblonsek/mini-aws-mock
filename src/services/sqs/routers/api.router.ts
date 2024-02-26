import { Request, Response, Router } from 'express';
import { env } from '@/core';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { createQueueSchema } from '../schemas/create-queue.schema';
import { generateQueueArn } from '../utils/generate-queue-url';
import { generateQueueUrl } from '../utils/generate-queue-arn';
import { sqsMessageDb } from '../dbs/sqs-message.db';
import { sqsMessageHistoryDb } from '../dbs/sqs-message-history.db';
import { sendMessageSchema } from '../schemas/send-message.schema';
import { createHash, randomUUID } from 'crypto';

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

apiRouter.patch('/api/sqs-queues/:queueName/purge', (req: Request, res: Response) => {
  const { queueName } = req.params;

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'name', value: queueName });

  if (!queue) {
    return res.status(404).send({ error: 'Queue not found.' });
  }

  sqsMessageDb.deleteByKeyValue({ key: 'queueUrl', value: queue.url });

  return res.status(204).send();
});

apiRouter.delete('/api/sqs-queues/:queueName', (req: Request, res: Response) => {
  const { queueName } = req.params;

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'name', value: queueName });

  if (!queue) {
    return res.status(404).send({ error: 'Queue not found.' });
  }

  sqsQueueDb.deleteByKeyValue({ key: 'url', value: queue.url });
  sqsMessageDb.deleteByKeyValue({ key: 'queueUrl', value: queue.url });
  sqsMessageHistoryDb.deleteByKeyValue({ key: 'queueUrl', value: queue.url });

  return res.status(204).send();
});

apiRouter.post('/api/sqs-messages', (req: Request, res: Response) => {
  const body = sendMessageSchema.safeParse({
    QueueUrl: req.body.queueUrl,
    MessageBody: req.body.messageBody,
    MessageAttributes: req.body.messageAttributes
      ? JSON.parse(req.body.messageAttributes)
      : undefined,
    DelaySeconds: req.body.delaySeconds,
  });

  if (!body.success) {
    return res.status(400).send({ error: `Invalid request body: ${body.error.message}.` });
  }

  const queue = sqsQueueDb.getFirstByKeyValue({ key: 'url', value: body.data.QueueUrl });

  if (!queue) {
    return res.status(404).send({ error: 'Queue not found.' });
  }

  const newMessage = sqsMessageDb.create({
    messageId: randomUUID(),
    messageBody: body.data.MessageBody,
    md5OfMessageBody: createHash('md5').update(body.data.MessageBody).digest('hex'),
    delaySeconds: body.data.DelaySeconds,
    visibilityTimeout: queue.visibilityTimeout,
    messageAttributes:
      body.data.MessageAttributes?.map((e) => ({
        name: e.Name,
        value: {
          dataType: e.Value.DataType,
          stringValue: e.Value.StringValue,
          binaryValue: e.Value.BinaryValue,
        },
      })) || [],
    md5OfMessageAttributes: body.data.MessageAttributes
      ? createHash('md5').update(JSON.stringify(body.data.MessageAttributes)).digest('hex')
      : undefined,
    queueUrl: queue.url,
    createdAt: new Date(),
  });

  return res.status(200).send(newMessage);
});

export { apiRouter };
