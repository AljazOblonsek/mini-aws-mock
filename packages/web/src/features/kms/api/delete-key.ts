import { KmsKeyDto } from '@mini-aws-mock/shared';

export const deleteKey = async (key: KmsKeyDto): Promise<void> => {
  const fetchResponse = await fetch(`http://localhost:8000/kms/keys/${key.id}`, {
    method: 'DELETE',
  });

  if (!fetchResponse.ok) {
    throw new Error('An error occurred while attempting to delete key.');
  }
};
