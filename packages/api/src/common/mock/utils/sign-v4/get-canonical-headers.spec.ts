import { getCanonicalHeaders } from './get-canonical-headers';
import { hash } from './hash-utils';

describe('getCanonicalHeaders', () => {
  it('should return only empty string hash if options are empty', () => {
    const canonicalHeaders = getCanonicalHeaders({
      signedHeaders: [],
      requestHeaders: {},
      textBody: '',
    });

    expect(canonicalHeaders).toBe(`x-amz-content-sha256:${hash('')}`);
  });
  it('should return canonical headers string', () => {
    const requestHeadersStub = {
      'x-amz-date': new Date().toISOString(),
      host: 'localhost:8000',
    } as const;

    const canonicalHeaders = getCanonicalHeaders({
      signedHeaders: ['x-amz-date', 'host'],
      requestHeaders: requestHeadersStub,
      textBody: '',
    });

    expect(canonicalHeaders).toBe(
      `host:${requestHeadersStub.host}\nx-amz-content-sha256:${hash('')}\nx-amz-date:${requestHeadersStub['x-amz-date']}`
    );
  });
});
