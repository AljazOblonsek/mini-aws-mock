import { Request, Response, Router } from 'express';
import { InvalidActionException, ValidationErrorException } from '@/common/exceptions';
import { logger, verifyV4SignatureMiddleware } from '@/core';
import { snsMockHandlerMap } from '@/services/sns';

const mockHandlerMap = {
  ...snsMockHandlerMap,
};

const mockRouter = Router();

mockRouter.post('/', verifyV4SignatureMiddleware, (req: Request, res: Response) => {
  logger.info(`Received request from AWS SDK - Action: ${req.body.Action}.`);
  logger.debug({ body: req.body }, 'Received request from AWS SDK.');

  if (!req.body.Action) {
    throw new ValidationErrorException();
  }

  const handler = mockHandlerMap[req.body.Action];

  if (!handler) {
    throw new InvalidActionException();
  }

  handler(req, res);
});

export { mockRouter };
