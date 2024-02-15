import { z } from 'zod';
import { baseSchema } from '@/core';

export const getQueueUrlSchema = baseSchema.extend({
  QueueName: z.string(),
});

export type GetQueueUrlSchema = z.infer<typeof getQueueUrlSchema>;
