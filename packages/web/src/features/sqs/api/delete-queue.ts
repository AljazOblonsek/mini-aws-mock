import { SqsQueueDto } from '@mini-aws-mock/shared';

export const deleteQueue = async (queue: SqsQueueDto): Promise<void> => {
  const fetchResponse = await fetch(`http://localhost:8000/sqs/queues/delete/${queue.name}`, {
    method: 'DELETE',
  });

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while attempting to delete queue.');
  }
};
