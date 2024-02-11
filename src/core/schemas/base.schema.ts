import z from 'zod';

export const baseSchema = z.object({
  Action: z.string().optional(),
  Version: z.string().optional(),
});

export type BaseSchema = z.infer<typeof baseSchema>;
