import { createQuery } from '@tanstack/solid-query';
import { getKeys } from '../api/get-keys';

export const useKeysQuery = () => {
  return createQuery(() => ({
    queryKey: ['keys'],
    queryFn: getKeys,
  }));
};
