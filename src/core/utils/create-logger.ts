import pino, { Logger } from 'pino';
import { env } from '../config/env';

export const createLogger = (name: string): Logger => {
  return pino({
    level: env.LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        messageFormat: `[${name}] {msg}`,
      },
    },
  });
};
