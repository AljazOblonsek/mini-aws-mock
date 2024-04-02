import { SqsQueueCreateRequestDto, SqsQueueDto } from '@mini-aws-mock/shared';
import { ServerError } from '@/common';

export const createQueue = async (dto: SqsQueueCreateRequestDto): Promise<SqsQueueDto> => {
  const fetchResponse = await fetch('http://localhost:8000/sqs/queues', {
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

  const response = (await fetchResponse.json()) as SqsQueueDto;
  return response;
};
