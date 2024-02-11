import { getHashedPayload } from './get-hashed-payload';

describe('getHashedPayload', () => {
  it('should return hashed payload', () => {
    const payloadStub =
      'TopicArn=arn%3Aaws%3Asns%3Aus-east-1%3A905168755765%3Atopic-1&Message=Yikes&Action=Publish&Version=2010-03-31';

    const hashedPayload = getHashedPayload(payloadStub);
    expect(hashedPayload).toBe('43a52f1b13e69553410eaaba7592cf9be0fa90364563a438650319ceffca0b70');
  });
});
