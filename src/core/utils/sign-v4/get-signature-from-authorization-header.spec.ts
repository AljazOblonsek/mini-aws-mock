import { getSignatureFromAuthorizationHeader } from './get-signature-from-authorization-header';

describe('getSignatureFromAuthorizationHeader', () => {
  it('should return null if not matches are found', () => {
    const authorizationHeaderStub =
      'AWS4-HMAC-SHA256 Credential=mock-access-key/20240119/eu-central-1/sns/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-user-agent, Signature=';

    const signature = getSignatureFromAuthorizationHeader(authorizationHeaderStub);
    expect(signature).toBe(null);
  });
  it('should return signature hash', () => {
    const authorizationHeaderStub =
      'AWS4-HMAC-SHA256 Credential=mock-access-key/20240119/eu-central-1/sns/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-user-agent, Signature=e9b6a4744aefbf3637c261f7a4e76d9f83eba22091709de37ff8573ddda8173e';

    const signature = getSignatureFromAuthorizationHeader(authorizationHeaderStub);
    expect(signature).toBe('e9b6a4744aefbf3637c261f7a4e76d9f83eba22091709de37ff8573ddda8173e');
  });
});
