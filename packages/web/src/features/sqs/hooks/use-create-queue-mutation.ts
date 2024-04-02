import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { createQueue } from '../api/create-queue';

export const useCreateQueueMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['create-queue'],
    mutationFn: createQueue,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      toast.success(`Successfully created new queue "${variables.name}".`);
    },
  }));
};
