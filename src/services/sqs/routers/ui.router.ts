import { Request, Response, Router } from 'express';
import { SqsQueueDto } from '../dtos/sqs-queue.dto';
import { sqsQueueDb } from '../dbs/sqs-queue.db';
import { sqsMessageDb } from '../dbs/sqs-message.db';
import { sqsMessageHistoryDb } from '../dbs/sqs-message-history.db';
import { SqsMessageDto } from '../dtos/sqs-message.dto';
import { SqsMessageHistoryDto } from '../dtos/sqs-message-history.dto';

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

uiRouter.get('/ui/sqs-messages', (req: Request, res: Response) => {
  const messages: SqsMessageDto[] = (sqsMessageDb.getAll() || []).map((e) => ({
    ...e,
    isInTransit: !!e.receiptHandle,
  }));

  res.render('./services/sqs/views/messages.ejs', { messages });
});

uiRouter.get('/ui/sqs-message-history', (req: Request, res: Response) => {
  const messages: SqsMessageHistoryDto[] = (sqsMessageHistoryDb.getAll() || []).map((e) => e);

  res.render('./services/sqs/views/message-history.ejs', { messages });
});

export { uiRouter };
