import { AwsException } from '@/src/common/mock';

export class KmsKeyDisabledException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'DisabledException',
      message: 'KMS Key is disabled',
    });
  }
}
