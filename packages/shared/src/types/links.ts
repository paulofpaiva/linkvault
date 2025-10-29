import type { Category } from './categories.js';

export type LinkStatus = 'unread' | 'read' | 'archived';

export interface Link {
  id: string;
  userId: string;
  url: string;
  title: string;
  notes?: string | null;
  status: LinkStatus;
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface LinksResponse {
  links: Link[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

