import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { deleteTopic } from '../api/delete-topic';

export const useDeleteTopicMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['delete-topic'],
    mutationFn: deleteTopic,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Successfully deleted topic "${variables.name}".`);
    },
  }));
};
