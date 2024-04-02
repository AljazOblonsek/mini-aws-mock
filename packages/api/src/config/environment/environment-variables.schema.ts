import { z } from 'zod';

const emptyStringToUndefined = (arg: unknown) => {
  if (typeof arg !== 'string') {
    return arg;
  }

  if (arg.trim() === '') {
    return undefined;
  }

  return arg;
};

export const environmentVariablesSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.preprocess(
    emptyStringToUndefined,
    z.enum(['development', 'production', 'test']).default('production')
  ),
  LOG_LEVEL: z.preprocess(
    emptyStringToUndefined,
    z.enum(['trace', 'debug', 'info']).default('info')
  ),
  LIST_RESPONSE_SIZE: z.coerce.number().optional(),
  DATABASE_PATH: z.preprocess(
    emptyStringToUndefined,
    z.string().optional().default('./data/database.sqlite3')
  ),

  AWS_REGION: z.preprocess(emptyStringToUndefined, z.string()),
  AWS_USER_ID: z.preprocess(emptyStringToUndefined, z.string()),
  AWS_ACCESS_KEY: z.preprocess(emptyStringToUndefined, z.string()),
  AWS_SECRET_KEY: z.preprocess(emptyStringToUndefined, z.string()),
});

export type EnvironmentVariablesSchema = z.infer<typeof environmentVariablesSchema>;
