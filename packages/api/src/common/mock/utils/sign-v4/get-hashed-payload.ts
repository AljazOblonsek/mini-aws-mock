import { hash } from './hash-utils';

export const getHashedPayload = (payload: string): string => {
  return hash(payload);
};
