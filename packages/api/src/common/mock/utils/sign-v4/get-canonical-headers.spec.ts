import { getCanonicalHeaders } from './get-canonical-headers';

describe('getCanonicalHeaders', () => {
  it('should return empty string if options are empty', () => {
    const canonicalHeaders = getCanonicalHeaders({
      signedHeaders: [],
      requestHeaders: {},
      textBody: '',
    });

    expect(canonicalHeaders).toBe('');
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
      `host:${requestHeadersStub.host}\nx-amz-date:${requestHeadersStub['x-amz-date']}`
    );
  });
});
