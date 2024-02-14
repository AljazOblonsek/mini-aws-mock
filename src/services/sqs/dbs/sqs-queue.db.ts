import { createDb, getInitialDataFromJson } from '@/core';
import { SqsQueue } from '../types/sqs-queue.type';

export const sqsQueueDb = createDb<SqsQueue>({
  name: 'sqs-queue',
  initialData: getInitialDataFromJson('sqs-queue'),
});
