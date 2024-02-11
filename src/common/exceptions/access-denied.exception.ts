import { AwsException } from '@/core';

export class AccessDeniedException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'AccessDeniedException',
      message: 'You do not have sufficient access to perform this action.',
    });
  }
}
