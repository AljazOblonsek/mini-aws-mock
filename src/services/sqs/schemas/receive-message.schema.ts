import { z } from 'zod';
import { baseSchema } from '@/core';

export const receiveMessageSchema = baseSchema.extend({
  QueueUrl: z.string(),
  AttributeNames: z.array(z.string()).optional(),
  MessageAttributeNames: z.array(z.string()).optional(),
  MaxNumberOfMessages: z.coerce.number().default(1),
  VisibilityTimeout: z.coerce.number().optional(),
  WaitTimeSeconds: z.coerce.number().optional(),
});

export type ReceiveMessageSchema = z.infer<typeof receiveMessageSchema>;
