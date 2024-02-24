import { createDb } from '@/core';
import { SqsMessageHistory } from '../types/sqs-message-history.type';

export const sqsMessageHistoryDb = createDb<SqsMessageHistory>({
  name: 'sqs-message-history',
});
