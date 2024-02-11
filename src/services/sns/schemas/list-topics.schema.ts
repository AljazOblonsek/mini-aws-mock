import z from 'zod';
import { baseSchema } from '@/core';

export const listTopicsSchema = baseSchema.extend({
  NextToken: z.string().optional(),
});

export type ListTopicsSchema = z.infer<typeof listTopicsSchema>;
