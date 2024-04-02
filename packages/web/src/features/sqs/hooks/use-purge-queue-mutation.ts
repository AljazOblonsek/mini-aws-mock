import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { purgeQueue } from '../api/purge-queue';

export const usePurgeQueueMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['purge-queue'],
    mutationFn: purgeQueue,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-history'] });
      toast.success(`Successfully purged queue "${variables.name}".`);
    },
  }));
};
