import { z } from 'zod';
import { baseSchema } from '@/core';

export const createTopicSchema = baseSchema.extend({
  Name: z.string(),
});

export type CreateTopicSchema = z.infer<typeof createTopicSchema>;
