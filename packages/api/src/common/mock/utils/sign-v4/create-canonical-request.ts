import { getCanonicalPath } from './get-canonical-path';
import { getCanonicalQuery } from './get-canonical-query';
import { getSignedHeadersFromAuthorizationHeader } from './get-signed-headers-from-authrization-header';
import { getCanonicalHeaders } from './get-canonical-headers';
import { hash } from './hash-utils';

type CreateCanonicalRequestOptions = {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  textBody: string;
};

export const createCanonicalRequest = ({
  method,
  path,
  query,
  headers,
  textBody,
}: CreateCanonicalRequestOptions): string => {
  const canonicalRequestValues: string[] = [];

  canonicalRequestValues.push(method);

  canonicalRequestValues.push(getCanonicalPath(path));

  canonicalRequestValues.push(getCanonicalQuery(query));

  const signedHeaders = getSignedHeadersFromAuthorizationHeader(headers.authorization);

  canonicalRequestValues.push(
    getCanonicalHeaders({
      signedHeaders,
      requestHeaders: headers,
      textBody: textBody,
    })
  );

  // Add another empty line after all headers
  canonicalRequestValues.push('');

  canonicalRequestValues.push(signedHeaders.join(';'));

  canonicalRequestValues.push(hash(textBody));

  return canonicalRequestValues.join('\n');
};
