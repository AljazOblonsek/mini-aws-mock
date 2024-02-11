import { getShortDateFromTimestamp } from './get-short-date-from-timestamp';
import { hmac } from './hash-utils';

type CreateSigningKeyOptions = {
  timestamp: string;
  secretKey: string;
  region: string;
  serviceName: string;
};

export const createSigningKey = ({
  timestamp,
  secretKey,
  region,
  serviceName,
}: CreateSigningKeyOptions): Buffer => {
  const kDate = hmac({
    payload: getShortDateFromTimestamp(timestamp),
    key: `AWS4${secretKey}`,
  });
  const kRegion = hmac({ payload: region, key: kDate });
  const kService = hmac({ payload: serviceName, key: kRegion });
  const kSigning = hmac({ payload: 'aws4_request', key: kService });

  return kSigning as Buffer;
};
