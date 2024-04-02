import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { createTopic } from '../api/create-topic';

export const useCreateTopicMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['create-topic'],
    mutationFn: createTopic,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Successfully created new topic "${variables.name}".`);
    },
  }));
};
