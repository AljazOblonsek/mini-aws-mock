import { KeySpec } from '@mini-aws-mock/shared';

type GetEncryptResponseOptions = {
  ciphertextBlob: string;
  keyId: string;
  encryptionAlgorithm: KeySpec;
};

export const getEncryptJsonResponse = ({
  ciphertextBlob,
  keyId,
  encryptionAlgorithm,
}: GetEncryptResponseOptions): object => ({
  CiphertextBlob: ciphertextBlob,
  KeyId: keyId,
  EncryptionAlgorithm: encryptionAlgorithm,
});
