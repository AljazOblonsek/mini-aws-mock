import toast from 'solid-toast';
import { createMutation } from '@tanstack/solid-query';
import { decrypt } from '../api/decrypt';

export const useDecryptMutation = () => {
  return createMutation(() => ({
    mutationKey: ['decrypt'],
    mutationFn: decrypt,
    onSuccess: () => {
      toast.success('Successfully decrypted content.');
    },
  }));
};
