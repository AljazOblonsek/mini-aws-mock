import { AwsException } from '@/src/common/mock';

// TODO: Currenlty not used - can be used for key expiry, deletion
export class KmsInvalidStateException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'KMSInvalidStateException',
      message: 'KMS Key in invalid state',
    });
  }
}
