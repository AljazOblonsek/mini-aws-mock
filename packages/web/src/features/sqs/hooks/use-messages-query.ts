import { createQuery } from '@tanstack/solid-query';
import { getMessages } from '../api/get-messages';

export const useMessagesQuery = () => {
  return createQuery(() => ({
    queryKey: ['messages'],
    queryFn: getMessages,
  }));
};
