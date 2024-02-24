import { Request, Response, Router } from 'express';
import { SqsQueueDto } from '../dtos/sqs-queue.dto';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { sqsMessageDb } from '../dbs/sqs-message.db';
import { sqsMessageHistoryDb } from '../dbs/sqs-message-history.db';

const uiRouter = Router();

uiRouter.get('/ui/sqs-queues', (req: Request, res: Response) => {
  const queues: SqsQueueDto[] = (sqsQueueDb.getAll() || []).map((e) => ({
    ...e,
    numberOfMessages: sqsMessageDb.getAllByKeyValue({ key: 'queueUrl', value: e.url })?.length || 0,
    numberOfMessagesInHistory:
      sqsMessageHistoryDb.getAllByKeyValue({ key: 'queueUrl', value: e.url })?.length || 0,
  }));

  res.render('./services/sqs/views/queues.ejs', { queues });
});

export { uiRouter };
