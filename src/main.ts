import app from '@/app';
import { env, logger } from '@/core';

const bootstrap = async () => {
  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}.`);
  });
};

bootstrap();
