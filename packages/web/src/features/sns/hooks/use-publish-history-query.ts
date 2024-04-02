import { createQuery } from '@tanstack/solid-query';
import { getPublishHistory } from '../api/get-publish-history';

export const usePublishHistoryQuery = () => {
  return createQuery(() => ({
    queryKey: ['publish-history'],
    queryFn: getPublishHistory,
  }));
};
