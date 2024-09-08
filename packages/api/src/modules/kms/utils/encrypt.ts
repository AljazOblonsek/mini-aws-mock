import { createCipheriv, randomBytes } from 'crypto';
import { IV_LENGTH, KEY_ID_LENGTH, TAG_LENGTH } from '../constants/encryption.constants';

type EncryptOptions = {
  keyId: string;
  encryptionKey: string;
  plaintextBlob: Buffer;
};

export const encrypt = ({ keyId, encryptionKey, plaintextBlob }: EncryptOptions) => {
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex'), iv);

  const ciphertext = Buffer.concat([cipher.update(plaintextBlob), cipher.final()]);

  const tag = cipher.getAuthTag();

  const header = Buffer.alloc(KEY_ID_LENGTH + IV_LENGTH + TAG_LENGTH);
  header.write(keyId, 0);
  iv.copy(header, KEY_ID_LENGTH);
  tag.copy(header, KEY_ID_LENGTH + IV_LENGTH);

  return Buffer.concat([header, ciphertext]);
};
