import { NextFunction, Request, Response } from 'express';
import { AwsException } from '../exceptions/aws.exception';
import { convertAwsExceptionToXml } from '../utils/convert-aws-exception-to-xml';
import { logger } from '..';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AwsException) {
    logger.error({ path: req.path, action: req.body.Action, error: err }, 'Throwing AWS error.');
    res.header('Content-Type', 'application/xml');
    return res.status(err.awsError.httpStatus).send(
      convertAwsExceptionToXml({
        awsException: err,
        requestId: req.headers['x-amzn-requestid'] as string,
      })
    );
  } else {
    logger.error({ path: req.path, error: err }, 'An unknown exception occurred.');
  }

  return next();
};
