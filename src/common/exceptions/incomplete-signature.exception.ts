import { AwsException } from '@/core';

export class IncompleteSignatureException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'IncompleteSignature',
      message: 'The request signature does not conform to AWS standards.',
    });
  }
}
