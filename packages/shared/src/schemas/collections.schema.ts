import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const createCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title must be 50 characters or less'),
  description: z.string().max(250, 'Description must be 250 characters or less').optional(),
  color: z.string().regex(hexColorRegex, 'Invalid color format'),
  isPrivate: z.boolean().optional(),
});

export const updateCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title must be 50 characters or less').optional(),
  description: z.string().max(250, 'Description must be 250 characters or less').optional(),
  color: z.string().regex(hexColorRegex, 'Invalid color format').optional(),
  isPrivate: z.boolean().optional(),
});

export const addLinksToCollectionSchema = z.object({
  linkIds: z.array(z.string().uuid()).min(1, 'At least one linkId is required'),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AddLinksToCollectionInput = z.infer<typeof addLinksToCollectionSchema>;


