import { AwsException } from '@/core';

export class InvalidActionException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'InvalidAction',
      message:
        'The action or operation requested is invalid. Verify that the action is typed correctly.',
    });
  }
}
