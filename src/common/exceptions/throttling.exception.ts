import { AwsException } from '@/core';

export class ThrottlingException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'ThrottlingException',
      message: 'The request was denied due to request throttling.',
    });
  }
}
