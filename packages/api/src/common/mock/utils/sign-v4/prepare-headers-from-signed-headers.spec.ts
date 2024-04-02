import { prepareHeadersFromSignedHeaders } from './prepare-headers-from-signed-headers';

describe('prepareHeadersFromSignedHeaders', () => {
  it('should return empty record if request headers are empty', () => {
    const preparedHeaders = prepareHeadersFromSignedHeaders(
      ['host', 'content-type', 'x-amz-date'],
      {}
    );
    expect(preparedHeaders).toMatchObject({});
  });
  it('should return alphabetically sorted record only with signed headers and add values to them', () => {
    const requestHeadersStub = {
      'x-amz-date': new Date().toISOString(),
      host: 'localhost:8000',
      'content-type': 'application/json',
      'x-another-header': 'some-value',
    } as const;

    const preparedHeaders = prepareHeadersFromSignedHeaders(
      ['host', 'content-type', 'x-amz-date'],
      requestHeadersStub
    );

    expect(preparedHeaders).toMatchObject({
      'content-type': requestHeadersStub['content-type'],
      host: requestHeadersStub.host,
      'x-amz-date': requestHeadersStub['x-amz-date'],
    });
    expect(preparedHeaders).not.toHaveProperty('x-another-header');
  });
  it('should return alphabetically sorted record only with signed headers and remove calculated headers that will be added later if provided', () => {
    const requestHeadersStub = {
      'x-amz-date': new Date().toISOString(),
      host: 'localhost:8000',
      'content-type': 'application/json',
      'x-another-header': 'some-value',
      'content-length': '109',
      'x-amz-content-sha256': '43a52f1b13e69553410eaaba7592cf9be0fa90364563a438650319ceffca0b70',
    } as const;

    const preparedHeaders = prepareHeadersFromSignedHeaders(
      ['host', 'content-type', 'x-amz-date'],
      requestHeadersStub
    );

    expect(preparedHeaders).toMatchObject({
      'content-type': requestHeadersStub['content-type'],
      host: requestHeadersStub.host,
      'x-amz-date': requestHeadersStub['x-amz-date'],
    });
    expect(preparedHeaders).not.toHaveProperty('x-another-header');
    expect(preparedHeaders).not.toHaveProperty('content-length');
    expect(preparedHeaders).not.toHaveProperty('x-amz-content-sha256');
  });
});
