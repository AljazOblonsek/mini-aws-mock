import { hash, hmac } from './hash-utils';

describe('hashUtils', () => {
  const payloadStub =
    'TopicArn=arn%3Aaws%3Asns%3Aus-east-1%3A905168755765%3Atopic-1&Message=Yikes&Action=Publish&Version=2010-03-31';

  describe('hash', () => {
    it('should return hex hash of the provided payload', () => {
      const hashedPayloadStub = '43a52f1b13e69553410eaaba7592cf9be0fa90364563a438650319ceffca0b70';

      const hashedPayload = hash(payloadStub);
      expect(hashedPayload).toBe(hashedPayloadStub);
    });
  });

  describe('hmac', () => {
    const hmacKey = 'my-key';
    const calculatedHmacStub = '0f46ed29aa00b2b78ef48b26cfd1ff25651f50babb75a209607638c24d113320';

    it('should return buffer hmac if no encoding is provided', () => {
      const calculatedHmac = hmac({ key: hmacKey, payload: payloadStub });
      expect(calculatedHmac).toStrictEqual(Buffer.from(calculatedHmacStub, 'hex'));
    });
    it('should return string hmac if hex encoding is provided', () => {
      const calculatedHmac = hmac({ key: hmacKey, payload: payloadStub, encoding: 'hex' });
      expect(calculatedHmac).toBe(calculatedHmacStub);
    });
  });
});
