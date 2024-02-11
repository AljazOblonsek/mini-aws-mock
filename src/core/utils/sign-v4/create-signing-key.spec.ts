import { createSigningKey } from './create-signing-key';

describe('createSigningKey', () => {
  it('should return signing key', () => {
    const calculatedSigningKeyStub =
      'd4b3d4f6bcbaff5f617c94d98c56af784df23820fc4e5b90bbfb692b2494634f';

    const signingKey = createSigningKey({
      timestamp: '20240120T095417Z',
      secretKey: 'my-secret-key',
      region: 'eu-central-1',
      serviceName: 'sns',
    });

    expect(signingKey).toStrictEqual(Buffer.from(calculatedSigningKeyStub, 'hex'));
  });
});
