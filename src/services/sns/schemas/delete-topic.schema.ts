import { z } from 'zod';
import { baseSchema } from '@/core';

export const deleteTopicSchema = baseSchema.extend({
  TopicArn: z.string(),
});

export type DeleteTopicSchema = z.infer<typeof deleteTopicSchema>;
