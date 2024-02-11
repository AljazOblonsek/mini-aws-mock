import { addCalculatedHeadersToPreparedHeaders } from './add-calculated-headers-to-prepared-headers';

describe('addCalculatedHeadersToPreparedHeaders', () => {
  const textBody =
    'TopicArn=arn%3Aaws%3Asns%3Aus-east-1%3A905168755765%3Atopic-1&Message=Yikes&Action=Publish&Version=2010-03-31';

  it('should return original headers if `content-type` is not provided', () => {
    const requestHeadersStub = {
      'x-amz-date': new Date().toISOString(),
      host: 'localhost:8000',
    } as const;

    const calculatedHeaders = addCalculatedHeadersToPreparedHeaders(requestHeadersStub, textBody);

    expect(calculatedHeaders).toMatchObject({
      host: requestHeadersStub.host,
      'x-amz-date': requestHeadersStub['x-amz-date'],
    });
  });
  it('should return original headers if `content-type` value is not equal to `application/x-www-form-urlencoded`', () => {
    const requestHeadersStub = {
      'x-amz-date': new Date().toISOString(),
      host: 'localhost:8000',
      'content-type': 'application/json',
    } as const;

    const calculatedHeaders = addCalculatedHeadersToPreparedHeaders(requestHeadersStub, textBody);

    expect(calculatedHeaders).toMatchObject({
      'content-type': requestHeadersStub['content-type'],
      host: requestHeadersStub.host,
      'x-amz-date': requestHeadersStub['x-amz-date'],
    });
  });
  it('should return alphabetically sorted headers with calculated values if `content-type` value equal to `application/x-www-form-urlencoded`', () => {
    const requestHeadersStub = {
      'x-amz-date': new Date().toISOString(),
      host: 'localhost:8000',
      'content-type': 'application/x-www-form-urlencoded',
    } as const;

    const calculatedHeaders = addCalculatedHeadersToPreparedHeaders(requestHeadersStub, textBody);

    expect(calculatedHeaders).toMatchObject({
      'content-length': '109',
      'content-type': requestHeadersStub['content-type'],
      host: requestHeadersStub.host,
      'x-amz-content-sha256': '43a52f1b13e69553410eaaba7592cf9be0fa90364563a438650319ceffca0b70',
      'x-amz-date': requestHeadersStub['x-amz-date'],
    });
  });
});
