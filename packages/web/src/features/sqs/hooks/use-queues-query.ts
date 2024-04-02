import { createQuery } from '@tanstack/solid-query';
import { getQueues } from '../api/get-queues';

export const useQueuesQuery = () => {
  return createQuery(() => ({
    queryKey: ['queues'],
    queryFn: getQueues,
  }));
};
