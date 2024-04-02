import { SnsTopicPublishHistoryDto } from '@mini-aws-mock/shared';

export const getPublishHistory = async (): Promise<SnsTopicPublishHistoryDto[]> => {
  const fetchResponse = await fetch('http://localhost:8000/sns/topics/publish-history');

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while fetching topics.');
  }

  const response = (await fetchResponse.json()) as SnsTopicPublishHistoryDto[];
  return response;
};
