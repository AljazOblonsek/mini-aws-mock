import { KmsDecryptRequestDto, KmsDecryptResponseDto } from '@mini-aws-mock/shared';
import { ServerError } from '@/common';

export const decrypt = async (dto: KmsDecryptRequestDto): Promise<KmsDecryptResponseDto> => {
  const fetchResponse = await fetch('http://localhost:8000/kms/decrypt', {
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

  const response = (await fetchResponse.json()) as KmsDecryptResponseDto;
  return response;
};
