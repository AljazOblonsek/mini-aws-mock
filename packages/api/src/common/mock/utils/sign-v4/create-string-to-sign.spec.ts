import { createStringToSign } from './create-string-to-sign';
import { getShortDateFromTimestamp } from './get-short-date-from-timestamp';
import { hash } from './hash-utils';

describe('createStringToSign', () => {
  it('should return joined string to sign', () => {
    const canonicalRequestStub =
      'POST\n' +
      '/sns/\n' +
      '\n' +
      'amz-sdk-invocation-id:37d0c5dc-57e5-4065-827e-c223426349f2\n' +
      'amz-sdk-request:attempt=1; max=3\n' +
      'content-length:109\n' +
      'content-type:application/x-www-form-urlencoded\n' +
      'host:localhost:8000\n' +
      'x-amz-content-sha256:43a52f1b13e69553410eaaba7592cf9be0fa90364563a438650319ceffca0b70\n' +
      'x-amz-date:20240120T095417Z\n' +
      'x-amz-user-agent:aws-sdk-js/3.490.0\n' +
      '\n' +
      'amz-sdk-invocation-id;amz-sdk-request;content-length;content-type;host;x-amz-content-sha256;x-amz-date;x-amz-user-agent\n' +
      '43a52f1b13e69553410eaaba7592cf9be0fa90364563a438650319ceffca0b70';
    const signatureTimestampStub = '20240120T095417Z';
    const regionStub = 'eu-central-1';
    const serviceNameStub = 'sns';

    const stringToSign = createStringToSign({
      canonicalRequest: canonicalRequestStub,
      signatureTimestamp: signatureTimestampStub,
      region: regionStub,
      serviceName: serviceNameStub,
    });

    expect(stringToSign).toBe(
      'AWS4-HMAC-SHA256\n' +
        `${signatureTimestampStub}\n` +
        `${getShortDateFromTimestamp(signatureTimestampStub)}/${regionStub}/${serviceNameStub}/aws4_request\n` +
        hash(canonicalRequestStub)
    );
  });
});
