import { AwsException } from '@/core';

export class NotAuthorizedException extends AwsException {
  constructor(message?: string) {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'NotAuthorized',
      message: message || 'You do not have permission to perform this action.',
    });
  }
}
