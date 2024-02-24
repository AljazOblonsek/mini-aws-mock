import { z } from 'zod';
import { baseSchema } from '@/core';
import {
  DEFAULT_RECEIVE_MESSAGE_WAIT_TIME_IN_SECONDS,
  DEFAULT_VISIBILITY_TIMEOUT_IN_SECONDS,
  MAXIMUM_MESSAGE_SIZE_IN_BYTES,
  MAXIMUM_RECEIVE_MESSAGE_WAIT_TIME_IN_SECONDS,
  MAXIMUM_VISIBILITY_TIMEOUT_IN_SECONDS,
  MINIMUM_MESSAGE_SIZE_IN_BYTES,
} from '../constants/sqs-queue.constants';

export const createQueueSchema = baseSchema.extend({
  QueueName: z.string(),
  Attributes: z
    .object({
      VisibilityTimeout: z.coerce
        .number()
        .min(0)
        .max(MAXIMUM_VISIBILITY_TIMEOUT_IN_SECONDS)
        .default(DEFAULT_VISIBILITY_TIMEOUT_IN_SECONDS),
      ReceiveMessageWaitTimeSeconds: z.coerce
        .number()
        .min(0)
        .max(MAXIMUM_RECEIVE_MESSAGE_WAIT_TIME_IN_SECONDS)
        .default(DEFAULT_RECEIVE_MESSAGE_WAIT_TIME_IN_SECONDS),
      MaximumMessageSize: z.coerce
        .number()
        .min(MINIMUM_MESSAGE_SIZE_IN_BYTES)
        .max(MAXIMUM_MESSAGE_SIZE_IN_BYTES)
        .default(MAXIMUM_MESSAGE_SIZE_IN_BYTES),
    })
    .default({
      VisibilityTimeout: DEFAULT_VISIBILITY_TIMEOUT_IN_SECONDS,
      ReceiveMessageWaitTimeSeconds: DEFAULT_RECEIVE_MESSAGE_WAIT_TIME_IN_SECONDS,
      MaximumMessageSize: MAXIMUM_MESSAGE_SIZE_IN_BYTES,
    }),
});

export type CreateQueueSchema = z.infer<typeof createQueueSchema>;
