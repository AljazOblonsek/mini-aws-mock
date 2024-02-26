import { createDb, getInitialDataFromJson } from '@/core';
import { SqsMessage } from '../types/sqs-message.type';

export const sqsMessageDb = createDb<SqsMessage>({
  name: 'sqs-message',
  initialData: getInitialDataFromJson('sqs-message'),
});
