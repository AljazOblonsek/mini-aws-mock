import { AwsException } from '@/src/common/mock';

export class ReceiptHandleIsInvalidException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'ValidationError',
      message: "The specified receipt handle isn't valid.",
    });
  }
}
