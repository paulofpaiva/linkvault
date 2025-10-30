export interface CollectionWithCount {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  color: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  linkCount: number;
}


