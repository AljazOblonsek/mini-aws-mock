import { createCanonicalRequest } from './create-canonical-request';
import { createStringToSign } from './create-string-to-sign';
import { getServiceNameFromAuthorizationHeader } from './get-service-name-from-authorization-header';
import { hmac } from './hash-utils';
import { createSigningKey } from './create-signing-key';

type GetV4SignatureOptions = {
  secretKey: string;
  region: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  textBody: string;
};

export const getV4Signature = ({
  secretKey,
  region,
  method,
  path,
  query,
  headers,
  textBody,
}: GetV4SignatureOptions): string | null => {
  const canonicalRequest = createCanonicalRequest({
    method: method,
    path: path,
    query: query,
    headers: headers,
    textBody: textBody,
  });

  const serviceName = getServiceNameFromAuthorizationHeader(headers.authorization);

  if (!serviceName) {
    return null;
  }

  const stringToSign = createStringToSign({
    canonicalRequest,
    signatureTimestamp: headers['x-amz-date'],
    region: region,
    serviceName,
  });

  const signingKey = createSigningKey({
    timestamp: headers['x-amz-date'],
    secretKey: secretKey,
    region: region,
    serviceName: serviceName,
  });

  const v4Signature = hmac({ payload: stringToSign, key: signingKey, encoding: 'hex' });
  return v4Signature as string;
};
