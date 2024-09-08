import { KeySpec } from '@mini-aws-mock/shared';

type GetDecryptResponseOptions = {
  plaintext: string;
  keyId: string;
  encryptionAlgorithm: KeySpec;
};

export const getDecryptJsonResponse = ({
  plaintext,
  keyId,
  encryptionAlgorithm,
}: GetDecryptResponseOptions): object => ({
  Plaintext: plaintext,
  KeyId: keyId,
  EncryptionAlgorithm: encryptionAlgorithm,
});
