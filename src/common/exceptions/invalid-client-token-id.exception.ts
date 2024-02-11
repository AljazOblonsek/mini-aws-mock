import { AwsException } from '@/core';

export class InvalidClientTokenIdException extends AwsException {
  constructor() {
    super({
      httpStatus: 403,
      type: 'Sender',
      code: 'InvalidClientTokenId',
      message: 'The X.509 certificate or AWS access key ID provided does not exist in our records',
    });
  }
}
