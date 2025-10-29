import { z } from 'zod';

export const linkStatusSchema = z.enum(['unread', 'read', 'archived']);

export const createLinkSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .trim()
    .transform((url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    })
    .pipe(z.string().url('Invalid URL')),
  title: z.string().min(1, 'Title is required'),
  notes: z.string().max(250, 'Notes must be 250 characters or less').optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateLinkSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .trim()
    .transform((url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    })
    .pipe(z.string().url('Invalid URL'))
    .optional(),
  title: z.string().min(1, 'Title is required').optional(),
  notes: z.string().max(250, 'Notes must be 250 characters or less').optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

