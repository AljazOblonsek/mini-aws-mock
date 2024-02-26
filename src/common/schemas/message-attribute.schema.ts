import { z } from 'zod';

const messageAttributeValueSchema = z.object({
  DataType: z.string(),
  StringValue: z.string().optional(),
  BinaryValue: z.unknown().optional(),
});

export const messageAttributeSchema = z.object({
  Name: z.string(),
  Value: messageAttributeValueSchema,
});
