import { SqsQueueDto } from '@mini-aws-mock/shared';

export const getQueues = async (): Promise<SqsQueueDto[]> => {
  const fetchResponse = await fetch('http://localhost:8000/sqs/queues');

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while fetching queues.');
  }

  const response = (await fetchResponse.json()) as SqsQueueDto[];
  return response;
};
