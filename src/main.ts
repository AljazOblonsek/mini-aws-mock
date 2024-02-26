import app from '@/app';
import { env, logger } from '@/core';
import { startRefreshSqsMessageVisbilityInterval } from './services/sqs';

const bootstrap = async () => {
  app.listen(env.PORT, () => {
    startRefreshSqsMessageVisbilityInterval();
    logger.info(`Server listening on port ${env.PORT}.`);
  });
};

bootstrap();
