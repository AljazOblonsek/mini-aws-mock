import { KmsEncryptDecryptRequestDto, KmsEncryptDecryptResponseDto } from '@mini-aws-mock/shared';
import { ServerError } from '@/common';

export const encryptDecrypt = async (
  dto: KmsEncryptDecryptRequestDto
): Promise<KmsEncryptDecryptResponseDto> => {
  const fetchResponse = await fetch('http://localhost:8000/kms/encrypt-decrypt', {
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

  const response = (await fetchResponse.json()) as KmsEncryptDecryptResponseDto;
  return response;
};
