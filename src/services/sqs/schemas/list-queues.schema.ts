import z from 'zod';
import { baseSchema } from '@/core';

export const listQueuesSchema = baseSchema.extend({
  MaxResults: z.coerce.number().optional(),
  QueueNamePrefix: z.string().optional(),
  NextToken: z.string().optional(),
});

export type ListQueuesSchema = z.infer<typeof listQueuesSchema>;
