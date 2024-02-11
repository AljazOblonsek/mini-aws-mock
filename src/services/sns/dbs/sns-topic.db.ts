import { createDb, getInitialDataFromJson } from '@/core';
import { SnsTopic } from '../types/sns-topic.type';

export const snsTopicDb = createDb<SnsTopic>({
  name: 'sns-topic',
  initialData: getInitialDataFromJson('sns-topic'),
});
