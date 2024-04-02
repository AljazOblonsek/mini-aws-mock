import { createHash, createHmac, BinaryToTextEncoding } from 'crypto';

export const hash = (payload: string) => {
  return createHash('sha256').update(payload, 'utf8').digest('hex');
};

type HmacOptions = {
  payload: string;
  key: string | Buffer;
  encoding?: BinaryToTextEncoding;
};

export const hmac = ({ payload, key, encoding }: HmacOptions): string | Buffer => {
  return encoding
    ? createHmac('sha256', key).update(payload, 'utf8').digest(encoding)
    : createHmac('sha256', key).update(payload, 'utf8').digest();
};
