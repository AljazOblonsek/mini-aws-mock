import { AwsException } from './aws.exception';

export class ValidationErrorException extends AwsException {
  constructor(message?: string) {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'ValidationError',
      message: message || 'The input fails to satisfy the constraints specified by an AWS service.',
    });
  }
}
