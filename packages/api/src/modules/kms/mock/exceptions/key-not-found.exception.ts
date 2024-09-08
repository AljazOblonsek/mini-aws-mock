import { AwsException } from '@/src/common/mock';

export class KeyNotFoundException extends AwsException {
  constructor() {
    super({
      httpStatus: 404,
      type: 'Sender',
      code: 'NotFound',
      message: 'Key does not exist',
    });
  }
}
