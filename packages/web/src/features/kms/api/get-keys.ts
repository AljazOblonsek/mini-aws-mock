import { KmsKeyDto } from '@mini-aws-mock/shared';

export const getKeys = async (): Promise<KmsKeyDto[]> => {
  const fetchResponse = await fetch('http://localhost:8000/kms/keys');

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while fetching keys.');
  }

  const response = (await fetchResponse.json()) as KmsKeyDto[];
  return response;
};
