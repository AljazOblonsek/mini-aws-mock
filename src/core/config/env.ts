import dotenv from 'dotenv';
import z from 'zod';
import { emptyStringToUndefined } from '../utils/empty-string-to-undefined';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.preprocess(
    emptyStringToUndefined,
    z.enum(['development', 'production', 'test']).default('production')
  ),
  LOG_LEVEL: z.preprocess(emptyStringToUndefined, z.enum(['debug', 'info']).default('info')),
  LIST_RESPONSE_SIZE: z.coerce.number().optional(),
  DATA_DIR: z.preprocess(emptyStringToUndefined, z.string().optional().default('./data')),

  AWS_REGION: z.preprocess(emptyStringToUndefined, z.string()),
  AWS_USER_ID: z.preprocess(emptyStringToUndefined, z.string()),
  AWS_ACCESS_KEY: z.preprocess(emptyStringToUndefined, z.string()),
  AWS_SECRET_KEY: z.preprocess(emptyStringToUndefined, z.string()),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `An error occurred during parsing env. Details: ${JSON.stringify(parsedEnv.error.issues)}.`
  );
}

export const env = Object.freeze(parsedEnv.data);
