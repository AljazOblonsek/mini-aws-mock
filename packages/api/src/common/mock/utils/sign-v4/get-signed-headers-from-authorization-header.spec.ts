import { getSignedHeadersFromAuthorizationHeader } from './get-signed-headers-from-authrization-header';

describe('getSignedHeadersFromAuthorizationHeader', () => {
  it('should return empty array if authorization header ios empty', () => {
    const signedHeaders = getSignedHeadersFromAuthorizationHeader('');

    expect(signedHeaders).toEqual([]);
  });
  it('should return empty array if no matches are found', () => {
    const authorizationHeader =
      'AWS4-HMAC-SHA256 Credential=mock-access-key/20240119/eu-central-1/sns/aws4_request, SignedHeaders=, Signature=e9b6a4744aefbf3637c261f7a4e76d9f83eba22091709de37ff8573ddda8173e';

    const signedHeaders = getSignedHeadersFromAuthorizationHeader(authorizationHeader);

    expect(signedHeaders).toEqual([]);
  });
  it('should return array of signed headers', () => {
    const authorizationHeader =
      'AWS4-HMAC-SHA256 Credential=mock-access-key/20240119/eu-central-1/sns/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-user-agent, Signature=e9b6a4744aefbf3637c261f7a4e76d9f83eba22091709de37ff8573ddda8173e';

    const signedHeaders = getSignedHeadersFromAuthorizationHeader(authorizationHeader);

    expect(signedHeaders).toEqual([
      'host',
      'x-amz-content-sha256',
      'x-amz-date',
      'x-amz-user-agent',
    ]);
  });
});
