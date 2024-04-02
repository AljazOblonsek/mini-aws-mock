import { SnsTopicDto } from '@mini-aws-mock/shared';

export const getTopics = async (): Promise<SnsTopicDto[]> => {
  const fetchResponse = await fetch('http://localhost:8000/sns/topics');

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while fetching topics.');
  }

  const response = (await fetchResponse.json()) as SnsTopicDto[];
  return response;
};
