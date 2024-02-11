import { Request, Response, Router } from 'express';
import { generateTopicArn } from '../utils/generate-topic-arn';
import { env } from '@/core';
import { snsTopicDb } from '../dbs/sns-topic.db';
import { snsTopicPublicHistoryDb } from '../dbs/sns-topic-publish-history.db';

const apiRouter = Router();

apiRouter.post('/api/sns-topics/', (req: Request, res: Response) => {
  const { topicName } = req.body;

  if (!topicName) {
    return res.status(400).send({ error: '`topicName` missing from request body.' });
  }

  const topic = snsTopicDb.getFirstByKeyValue({ key: 'name', value: topicName });

  if (topic) {
    return res.status(409).send({ error: 'Topic with same name already exists.' });
  }

  const newTopic = snsTopicDb.create({
    name: topicName,
    arn: generateTopicArn({
      region: env.AWS_REGION,
      userId: env.AWS_USER_ID,
      name: topicName,
    }),
  });

  return res.status(200).send(newTopic);
});

apiRouter.delete('/api/sns-topics/:topicArn', (req: Request, res: Response) => {
  const { topicArn } = req.params;

  const topic = snsTopicDb.getFirstByKeyValue({ key: 'arn', value: topicArn });

  if (!topic) {
    return res.status(404).send({ error: 'Topic not found.' });
  }

  snsTopicDb.deleteByKeyValue({ key: 'arn', value: topicArn });

  return res.status(204).send();
});

apiRouter.delete('/api/sns-topic-publish-history', (req: Request, res: Response) => {
  snsTopicPublicHistoryDb.deleteAll();
  return res.status(204).send();
});

export { apiRouter };
