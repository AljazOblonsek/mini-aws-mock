import { SqsMessageDto, SqsSendMessageRequestDto } from '@mini-aws-mock/shared';
import { ServerError } from '@/common';

export const sendMessage = async (dto: SqsSendMessageRequestDto): Promise<SqsMessageDto> => {
  const fetchResponse = await fetch('http://localhost:8000/sqs/queues/send-message', {
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

  const response = (await fetchResponse.json()) as SqsMessageDto;
  return response;
};
