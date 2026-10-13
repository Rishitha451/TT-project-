import { z } from 'zod';

export const advisorMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Please enter a question or topic')
    .max(500, 'Message cannot exceed 500 characters'),
});

export type AdvisorMessageFormData = z.infer<typeof advisorMessageSchema>;
