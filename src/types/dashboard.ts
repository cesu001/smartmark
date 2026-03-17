export interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}

export interface Collection {
  id: string;
  name: string;
  noteCount: number;
  isFavorite: boolean;
}

export interface Tag {
  id: string;
  name: string;
  noteCount: number;
  isAiGenerated: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isFavorite: boolean;
  collectionId: string | null;
  tags: string[]; // tag IDs
  updatedAt: string;
}
