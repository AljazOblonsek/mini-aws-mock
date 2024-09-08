import { KmsEncryptionHistoryDto } from '@mini-aws-mock/shared';

export const getEncryptionHistory = async (): Promise<KmsEncryptionHistoryDto[]> => {
  const fetchResponse = await fetch('http://localhost:8000/kms/encryption-history');

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while fetching encryption history.');
  }

  const response = (await fetchResponse.json()) as KmsEncryptionHistoryDto[];
  return response;
};
