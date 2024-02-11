import { createDb } from '@/core';
import { SnsTopicPublishHistory } from '../types/sns-topic-publish-history.type';

export const snsTopicPublicHistoryDb = createDb<SnsTopicPublishHistory>({
  name: 'sns-topic-publish-history',
});
