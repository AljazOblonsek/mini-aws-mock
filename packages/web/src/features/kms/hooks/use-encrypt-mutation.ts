import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { encrypt } from '../api/encrypt';

export const useEncryptMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['encrypt'],
    mutationFn: encrypt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      queryClient.invalidateQueries({ queryKey: ['encryption-history'] });
      toast.success('Successfully encrypted content.');
    },
  }));
};
