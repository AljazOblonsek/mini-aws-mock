import { getServiceNameFromAuthorizationHeader } from './get-service-name-from-authorization-header';

describe('getServiceNameFromAuthorizationHeader', () => {
  it('should return null if not matches are found', () => {
    const authorizationHeaderStub =
      'AWS4-HMAC-SHA256 Credential=, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-user-agent, Signature=e9b6a4744aefbf3637c261f7a4e76d9f83eba22091709de37ff8573ddda8173e';

    const serviceName = getServiceNameFromAuthorizationHeader(authorizationHeaderStub);
    expect(serviceName).toBe(null);
  });
  it('should return null if split length of matches credentials is not 5', () => {
    const authorizationHeaderStub =
      'AWS4-HMAC-SHA256 Credential=20240119/sns/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-user-agent, Signature=e9b6a4744aefbf3637c261f7a4e76d9f83eba22091709de37ff8573ddda8173e';

    const serviceName = getServiceNameFromAuthorizationHeader(authorizationHeaderStub);
    expect(serviceName).toBe(null);
  });
  it('should return service name', () => {
    const authorizationHeaderStub =
      'AWS4-HMAC-SHA256 Credential=mock-access-key/20240119/eu-central-1/sns/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-user-agent, Signature=e9b6a4744aefbf3637c261f7a4e76d9f83eba22091709de37ff8573ddda8173e';

    const serviceName = getServiceNameFromAuthorizationHeader(authorizationHeaderStub);
    expect(serviceName).toBe('sns');
  });
});
