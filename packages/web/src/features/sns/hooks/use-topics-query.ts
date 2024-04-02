import { createQuery } from '@tanstack/solid-query';
import { getTopics } from '../api/get-topics';

export const useTopicsQuery = () => {
  return createQuery(() => ({
    queryKey: ['topics'],
    queryFn: getTopics,
  }));
};
