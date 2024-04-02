import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { purgePublishHistory } from '../api/purge-publish-history';

export const usePurgePublishHistoryMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['purge-publish-history'],
    mutationFn: purgePublishHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['publish-history'] });
      toast.success('Successfully purged publish history.');
    },
  }));
};
