import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AwsException } from '../exceptions/aws.exception';
import { convertAwsExceptionToJson } from '../utils/convert-aws-exception-to-json';
import { InternalFailureException } from '../exceptions/internal-failure.exception';

@Catch()
export class MockExceptionsFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    this.logger = new Logger(this.constructor.name);
  }

  catch(err: Error, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    this.logger.error({ error: err }, 'Throwing AWS error.');

    const req = host.switchToHttp().getRequest();
    const res = host.switchToHttp().getResponse();

    res.header('content-type', req.headers['content-type']);

    const statusCode = err instanceof AwsException ? err.awsError.httpStatus : 500;
    const awsExceptionJsonType = convertAwsExceptionToJson({
      awsException: err instanceof AwsException ? err : new InternalFailureException(),
    });

    httpAdapter.reply(res, awsExceptionJsonType, statusCode);
  }
}
