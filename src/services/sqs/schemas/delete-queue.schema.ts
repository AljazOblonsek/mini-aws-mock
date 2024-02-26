import { z } from 'zod';
import { baseSchema } from '@/core';

export const deleteQueueSchema = baseSchema.extend({
  QueueUrl: z.string(),
});

export type DeleteQueueSchema = z.infer<typeof deleteQueueSchema>;
