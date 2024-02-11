import { AwsException } from '@/core';

export class ServiceUnavailableException extends AwsException {
  constructor() {
    super({
      httpStatus: 503,
      type: 'Server',
      code: 'ServiceUnavailable',
      message: 'The request has failed due to a temporary failure of the server.',
    });
  }
}
