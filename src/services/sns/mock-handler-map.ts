import { Request, Response } from 'express';
import { createTopic } from './handlers/create-topic';
import { deleteTopic } from './handlers/delete-topic';
import { listTopics } from './handlers/list-topics';
import { publish } from './handlers/publish';

export const mockHandlerMap = {
  CreateTopic: createTopic,
  DeleteTopic: deleteTopic,
  ListTopics: listTopics,
  Publish: publish,
} as Readonly<Record<string, (req: Request, res: Response) => Response>>;
