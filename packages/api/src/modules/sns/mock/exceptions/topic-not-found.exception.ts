import { AwsException } from '@/src/common/mock';

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
