import { AwsException } from '@/core';

export class RequestExpiredException extends AwsException {
  constructor() {
    super({
      httpStatus: 400,
      type: 'Sender',
      code: 'RequestExpired',
      message:
        'The request reached the service more than 15 minutes after the date stamp on the request or more than 15 minutes after the request expiration date (such as for pre-signed URLs), or the date stamp on the request is more than 15 minutes in the future.',
    });
  }
}
