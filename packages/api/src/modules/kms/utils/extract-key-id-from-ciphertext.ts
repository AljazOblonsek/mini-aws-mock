import { KEY_ID_LENGTH } from '../constants/encryption.constants';

type ExtractKeyIdFromCiphertextBlob = {
  ciphertextBlob: Buffer;
};

export const extractKeyIdFromCiphertextBlob = ({
  ciphertextBlob,
}: ExtractKeyIdFromCiphertextBlob): string => {
  return ciphertextBlob.subarray(0, KEY_ID_LENGTH).toString();
};
