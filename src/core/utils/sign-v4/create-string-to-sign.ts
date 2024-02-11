import { getShortDateFromTimestamp } from './get-short-date-from-timestamp';
import { hash } from './hash-utils';

type CreateStringToSignOptions = {
  canonicalRequest: string;
  signatureTimestamp: string;
  region: string;
  serviceName: string;
};

export const createStringToSign = ({
  canonicalRequest,
  signatureTimestamp,
  region,
  serviceName,
}: CreateStringToSignOptions): string => {
  const encodedCanonicalRequest = hash(canonicalRequest);

  return [
    'AWS4-HMAC-SHA256',
    signatureTimestamp,
    `${getShortDateFromTimestamp(signatureTimestamp)}/${region}/${serviceName}/aws4_request`,
    encodedCanonicalRequest,
  ].join('\n');
};
