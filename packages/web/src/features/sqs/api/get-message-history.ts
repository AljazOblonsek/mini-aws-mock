import { SqsMessageHistoryDto } from '@mini-aws-mock/shared';

export const getMessageHistory = async (): Promise<SqsMessageHistoryDto[]> => {
  const fetchResponse = await fetch('http://localhost:8000/sqs/queues/message-history');

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while fetching whole message history.');
  }

  const response = (await fetchResponse.json()) as SqsMessageHistoryDto[];
  return response;
};
