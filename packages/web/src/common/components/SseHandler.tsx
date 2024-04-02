import { SseNotification, SseNotificationType } from '@mini-aws-mock/shared';
import { useQueryClient } from '@tanstack/solid-query';
import { onCleanup, onMount } from 'solid-js';

export const SseHandler = () => {
  const queryClient = useQueryClient();

  onMount(() => {
    const onMessage = (e: MessageEvent<string>) => {
      const notification = JSON.parse(e.data) as SseNotification;

      switch (notification.type) {
        case SseNotificationType.SnsPublish:
          queryClient.invalidateQueries({ queryKey: ['topics'] });
          queryClient.invalidateQueries({ queryKey: ['publish-history'] });
          break;
        case SseNotificationType.SqsMessageUpdate:
          queryClient.invalidateQueries({ queryKey: ['queues'] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['message-history'] });
          break;
        default:
          break;
      }
    };

    const eventSource = new EventSource('http://localhost:8000/sse/notifications');

    eventSource.addEventListener('SSE.NOTIFICATION', onMessage);

    onCleanup(() => {
      eventSource.removeEventListener('SSE.NOTIFICATION', onMessage);
      eventSource.close();
    });
  });

  return <></>;
};
