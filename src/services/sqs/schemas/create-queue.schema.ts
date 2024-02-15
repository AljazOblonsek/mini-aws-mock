import { z } from 'zod';
import { baseSchema } from '@/core';

export const createQueueSchema = baseSchema.extend({
  QueueName: z.string(),
  Attributes: z
    .object({
      VisibilityTimeout: z.coerce.number().min(0).max(43200).default(30),
      ReceiveMessageWaitTimeSeconds: z.coerce.number().min(0).max(20).default(0),
      MaximumMessageSize: z.coerce.number().min(1024).max(262144).default(262144),
    })
    .default({
      VisibilityTimeout: 30,
      ReceiveMessageWaitTimeSeconds: 0,
      MaximumMessageSize: 262144,
    }),
});

export type CreateQueueSchema = z.infer<typeof createQueueSchema>;
