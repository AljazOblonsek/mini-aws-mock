import { createDecipheriv } from 'crypto';
import { IV_LENGTH, KEY_ID_LENGTH, TAG_LENGTH } from '../constants/encryption.constants';

type DecryptOptions = {
  encryptionKey: string;
  ciphertextBlob: Buffer;
};

export const decrypt = ({ ciphertextBlob, encryptionKey }: DecryptOptions): Buffer => {
  const _keyId = ciphertextBlob.subarray(0, KEY_ID_LENGTH).toString();
  const iv = ciphertextBlob.subarray(KEY_ID_LENGTH, KEY_ID_LENGTH + IV_LENGTH);
  const tag = ciphertextBlob.subarray(
    KEY_ID_LENGTH + IV_LENGTH,
    KEY_ID_LENGTH + IV_LENGTH + TAG_LENGTH
  );
  const encryptedData = ciphertextBlob.subarray(KEY_ID_LENGTH + IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted;
};
