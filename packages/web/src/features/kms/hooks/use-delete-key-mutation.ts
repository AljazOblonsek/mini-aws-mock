import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { deleteKey } from '../api/delete-key';

export const useDeleteKeyMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['delete-key'],
    mutationFn: deleteKey,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      toast.success(`Successfully deleted key "${variables.alias}".`);
    },
  }));
};
