import { Request, Response } from 'express';
import { createQueue } from './handlers/create-queue';
import { deleteQueue } from './handlers/delete-queue';
import { getQueueUrl } from './handlers/get-queue-url';
import { listQueues } from './handlers/list-queues';
import { sendMessage } from './handlers/send-message';
import { receiveMessage } from './handlers/receive-message';

export const mockHandlerMap = {
  CreateQueue: createQueue,
  DeleteQueue: deleteQueue,
  GetQueueUrl: getQueueUrl,
  ListQueues: listQueues,
  SendMessage: sendMessage,
  ReceiveMessage: receiveMessage,
} as Readonly<Record<string, (req: Request, res: Response) => Response>>;
