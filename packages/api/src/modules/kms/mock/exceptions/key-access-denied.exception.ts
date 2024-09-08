import { AwsException } from '@/src/common/mock';

export class KeyAccessDeniedException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'AccessDeniedException',
      message: 'Key access denied',
    });
  }
}
