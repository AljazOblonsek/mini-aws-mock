import { z } from 'zod';
import { baseSchema } from '@/core';

export const deleteMessageSchema = baseSchema.extend({
  QueueUrl: z.string(),
  ReceiptHandle: z.string(),
});

export type DeleteMessageSchema = z.infer<typeof deleteMessageSchema>;
