import { z } from 'zod';

export const exploreSearchUsersSchema = z.object({
  q: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const explorePagedSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type ExploreSearchUsersInput = z.infer<typeof exploreSearchUsersSchema>;
export type ExplorePagedInput = z.infer<typeof explorePagedSchema>;


