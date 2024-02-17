import { z } from 'zod';
import { baseSchema } from '@/core';
import { messageAttributeSchema } from '@/common';

export const sendMessageSchema = baseSchema.extend({
  QueueUrl: z.string(),
  MessageBody: z.string(),
  MessageAttributes: z.array(messageAttributeSchema).optional(),
  DelaySeconds: z.coerce.number().optional(),
});

export type SendMessageSchema = z.infer<typeof sendMessageSchema>;
