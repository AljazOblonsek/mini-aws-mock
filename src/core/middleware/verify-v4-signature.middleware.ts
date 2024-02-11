import {
  InternalFailureException,
  NotAuthorizedException,
  ValidationErrorException,
} from '@/common/exceptions';
import { NextFunction, Request, Response } from 'express';
import { getSignatureFromAuthorizationHeader, getV4Signature } from '../utils/sign-v4';
import { env, logger } from '..';

export const verifyV4SignatureMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.debug('Starting signature verification process.');

  if (!('x-amz-date' in req.headers)) {
    throw new ValidationErrorException(
      '`x-amz-date` header is missing but is  requried to verify signature.'
    );
  }

  if (!('authorization' in req.headers)) {
    throw new NotAuthorizedException('`authorization` header is missing.');
  }

  const clientSignature = getSignatureFromAuthorizationHeader(req.headers.authorization as string);

  if (!clientSignature) {
    throw new NotAuthorizedException(
      'Could not extract signature hash from `authorization` header.'
    );
  }

  const serverSignature = getV4Signature({
    secretKey: env.AWS_SECRET_KEY,
    region: env.AWS_REGION,
    method: req.method,
    path: req.path,
    query: req.query as Record<string, string>,
    headers: req.headers as Record<string, string>,
    textBody: req.textBody,
  });

  if (!serverSignature) {
    throw new InternalFailureException('Failed to calculate signature.');
  }

  if (clientSignature !== serverSignature) {
    throw new NotAuthorizedException();
  }

  return next();
};
