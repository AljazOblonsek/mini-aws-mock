import { Request, Response, Router } from 'express';
import { SnsTopicDto } from '../dtos/sns-topic.dto';
import { snsTopicDb } from '../dbs/sns-topic.db';
import { snsTopicPublicHistoryDb } from '../dbs/sns-topic-publish-history.db';
import {
  SnsTopicPublicHistoryDto,
  transformSnsTopicPublishHistoryToDto,
} from '../dtos/sns-topic-publish-history.dto';

const uiRouter = Router();

uiRouter.get('/ui/sns-topics', (req: Request, res: Response) => {
  const topics: SnsTopicDto[] = (snsTopicDb.getAll() || []).map((e) => ({
    ...e,
    numberOfPublishes:
      snsTopicPublicHistoryDb.getAllByKeyValue({ key: 'TopicArn', value: e.arn })?.length || 0,
  }));

  res.render('./services/sns/views/topics.ejs', { topics });
});

uiRouter.get('/ui/sns-publish-history', (req: Request, res: Response) => {
  const publishHistoryRecords: SnsTopicPublicHistoryDto[] = (snsTopicPublicHistoryDb.getAll() || [])
    .map((e) => transformSnsTopicPublishHistoryToDto(e))
    .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());

  res.render('./services/sns/views/publish-history.ejs', { publishHistoryRecords });
});

export { uiRouter };
