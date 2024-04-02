import { AwsException } from '@/src/common/mock';

export class QueueDoesNotExistException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'QueueDoesNotExist',
      message: "The specified queue doesn't exist.",
    });
  }
}
