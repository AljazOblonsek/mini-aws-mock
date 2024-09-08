import { createQuery } from '@tanstack/solid-query';
import { getEncryptionHistory } from '../api/get-encrytion-history';

export const useEncryptionHistoryQuery = () => {
  return createQuery(() => ({
    queryKey: ['encryption-history'],
    queryFn: getEncryptionHistory,
  }));
};
