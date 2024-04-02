import toast from 'solid-toast';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { sendMessage } from '../api/send-message';

export const useSendMessageMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['send-message'],
    mutationFn: sendMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-history'] });
      toast.success(`Successfully sent new message to "${variables.queueUrl}".`);
    },
  }));
};
