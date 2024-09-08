import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { createKey } from '../api/create-key';

export const useCreateKeyMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['create-key'],
    mutationFn: createKey,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      queryClient.invalidateQueries({ queryKey: ['encryption-history'] });
      toast.success(`Successfully created new key "${variables.alias}".`);
    },
  }));
};
