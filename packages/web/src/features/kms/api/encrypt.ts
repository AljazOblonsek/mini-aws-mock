import { KmsEncryptRequestDto, KmsEncryptResponseDto } from '@mini-aws-mock/shared';
import { ServerError } from '@/common';

export const encrypt = async (dto: KmsEncryptRequestDto): Promise<KmsEncryptResponseDto> => {
  const fetchResponse = await fetch('http://localhost:8000/kms/encrypt', {
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

  const response = (await fetchResponse.json()) as KmsEncryptResponseDto;
  return response;
};
