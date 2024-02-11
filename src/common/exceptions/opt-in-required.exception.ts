import { AwsException } from '@/core';

export class OptInRequiredException extends AwsException {
  constructor() {
    super({
      httpStatus: 403,
      type: 'Sender',
      code: 'OptInRequired',
      message: 'The AWS access key ID needs a subscription for the service.',
    });
  }
}
