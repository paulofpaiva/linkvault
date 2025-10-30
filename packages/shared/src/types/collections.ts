export interface Collection {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  color: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionLink {
  id: string;
  collectionId: string;
  linkId: string;
  createdAt: string;
}

export interface CollectionWithCount extends Collection {
  linkCount: number;
}

export interface CollectionsResponse {
  collections: CollectionWithCount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


