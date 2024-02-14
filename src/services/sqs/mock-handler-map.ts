import { Request, Response } from 'express';
import { createQueue } from './handlers/create-queue';

export const mockHandlerMap = {
  CreateQueue: createQueue,
} as Readonly<Record<string, (req: Request, res: Response) => Response>>;
