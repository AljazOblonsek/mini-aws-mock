import { createCanonicalRequest } from './create-canonical-request';

describe('createCanonicalRequest', () => {
  it('should return canonical request from given express request object', () => {
    const request = {
      method: 'POST',
      path: '/sns/',
      query: {},
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': '109',
        host: 'localhost:8000',
        'x-amz-user-agent': 'aws-sdk-js/3.490.0',
        'user-agent':
          'aws-sdk-js/3.490.0 ua/2.0 os/win32#10.0.19045 lang/js md/nodejs#18.17.1 api/sns#3.490.0',
        'amz-sdk-invocation-id': '37d0c5dc-57e5-4065-827e-c223426349f2',
        'amz-sdk-request': 'attempt=1; max=3',
        'x-amz-date': '20240120T095417Z',
        'x-amz-content-sha256': '43a52f1b13e69553410eaaba7592cf9be0fa90364563a438650319ceffca0b70',
        authorization:
          'AWS4-HMAC-SHA256 Credential=mock-access-key/20240120/eu-central-1/sns/aws4_request, SignedHeaders=amz-sdk-invocation-id;amz-sdk-request;content-length;content-type;host;x-amz-content-sha256;x-amz-date;x-amz-user-agent, Signature=72dc61b6b012830bb279a6b82ce44cfd1a2cd665bc6d3d047b3f63f2d27adba7',
        connection: 'keep-alive',
      },
      textBody:
        'TopicArn=arn%3Aaws%3Asns%3Aus-east-1%3A905168755765%3Atopic-1&Message=Yikes&Action=Publish&Version=2010-03-31',
    };

    const expectedCanonicalRequest =
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

    const canonicalRequest = createCanonicalRequest(request);

    expect(canonicalRequest).toBe(expectedCanonicalRequest);
  });
});
