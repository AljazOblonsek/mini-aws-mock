import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();

  req.headers['x-amzn-requestid'] = requestId;
  res.header('x-amzn-requestid', requestId);

  return next();
};
