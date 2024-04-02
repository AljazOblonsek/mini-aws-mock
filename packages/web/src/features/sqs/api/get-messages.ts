import { SqsMessageDto } from '@mini-aws-mock/shared';

export const getMessages = async (): Promise<SqsMessageDto[]> => {
  const fetchResponse = await fetch('http://localhost:8000/sqs/queues/messages');

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while fetching messages.');
  }

  const response = (await fetchResponse.json()) as SqsMessageDto[];
  return response;
};
