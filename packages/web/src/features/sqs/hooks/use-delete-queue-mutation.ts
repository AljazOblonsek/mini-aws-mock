import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { deleteQueue } from '../api/delete-queue';

export const useDeleteQueueMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['delete-queue'],
    mutationFn: deleteQueue,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-history'] });
      toast.success(`Successfully deleted queue "${variables.name}".`);
    },
  }));
};
