import z from 'zod';
import { baseSchema } from '@/core';

const messageAttributeValueSchema = z.object({
  DataType: z.string(),
  StringValue: z.string().optional(),
  BinaryValue: z.unknown().optional(),
});

const messageAttributeEntrySchema = z.object({
  Name: z.string(),
  Value: messageAttributeValueSchema,
});

export const publishSchema = baseSchema.extend({
  Message: z.string().optional(),
  MessageAttributes: z.array(messageAttributeEntrySchema).optional(),
  MessageDeduplicationId: z.string().optional(),
  MessageGroupId: z.string().optional(),
  MessageStructure: z.string().optional(),
  PhoneNumber: z.string().optional(),
  Subject: z.string().optional(),
  TargetArn: z.string().optional(),
  TopicArn: z.string().optional(),
});

export type PublishSchema = z.infer<typeof publishSchema>;
