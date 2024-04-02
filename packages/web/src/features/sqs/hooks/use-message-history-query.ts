import { createQuery } from '@tanstack/solid-query';
import { getMessageHistory } from '../api/get-message-history';

export const useMessageHistoryQuery = () => {
  return createQuery(() => ({
    queryKey: ['message-history'],
    queryFn: getMessageHistory,
  }));
};
