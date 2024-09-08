import { KmsKeyCreateRequestDto, KmsKeyDto } from '@mini-aws-mock/shared';
import { ServerError } from '@/common';

export const createKey = async (dto: KmsKeyCreateRequestDto): Promise<KmsKeyDto> => {
  const fetchResponse = await fetch('http://localhost:8000/kms/keys', {
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

  const response = (await fetchResponse.json()) as KmsKeyDto;
  return response;
};
