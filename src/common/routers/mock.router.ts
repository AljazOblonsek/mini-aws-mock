import { Request, Response, Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { InvalidActionException, ValidationErrorException } from '@/common/exceptions';
import { logger, verifyV4SignatureMiddleware } from '@/core';
import { snsMockHandlerMap } from '@/services/sns';
import { sqsMockHandlerMap } from '@/services/sqs';

const mockHandlerMap = {
  ...snsMockHandlerMap,
  ...sqsMockHandlerMap,
};

const mockRouter = Router();

mockRouter.post(
  '/',
  verifyV4SignatureMiddleware,
  expressAsyncHandler(async (req: Request, res: Response) => {
    logger.info(`Received request from AWS SDK - Action: ${req.body.Action}.`);
    logger.debug({ body: req.body }, 'Received request from AWS SDK.');

    if (!req.body.Action) {
      throw new ValidationErrorException();
    }

    const handler = mockHandlerMap[req.body.Action];

    if (!handler) {
      throw new InvalidActionException();
    }

    await handler(req, res);
  })
);

export { mockRouter };
