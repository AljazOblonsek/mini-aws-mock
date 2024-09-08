import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { decrypt } from '../api/decrypt';

export const useDecryptMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['decrypt'],
    mutationFn: decrypt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      queryClient.invalidateQueries({ queryKey: ['encryption-history'] });
      toast.success('Successfully decrypted content.');
    },
  }));
};
