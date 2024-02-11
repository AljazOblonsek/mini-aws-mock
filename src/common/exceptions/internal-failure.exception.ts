import { AwsException } from '@/core';

export class InternalFailureException extends AwsException {
  constructor(message?: string) {
    super({
      httpStatus: 500,
      type: 'Server',
      code: 'InternalFailure',
      message:
        message ||
        'The request processing has failed because of an unknown error, exception or failure.',
    });
  }
}
