import { SnsTopicCreateRequestDto, SnsTopicDto } from '@mini-aws-mock/shared';
import { ServerError } from '@/common';

export const createTopic = async (dto: SnsTopicCreateRequestDto): Promise<SnsTopicDto> => {
  const fetchResponse = await fetch('http://localhost:8000/sns/topics', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!fetchResponse.ok) {
    const errorResponse = (await fetchResponse.json()) as ServerError;
    throw new Error(errorResponse.message);
  }

  const response = (await fetchResponse.json()) as SnsTopicDto;
  return response;
};
