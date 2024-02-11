import { AwsException } from '@/core';

export class TopicNotFoundException extends AwsException {
  constructor() {
    super({
      httpStatus: 404,
      type: 'Sender',
      code: 'NotFound',
      message: 'Topic does not exist',
    });
  }
}
