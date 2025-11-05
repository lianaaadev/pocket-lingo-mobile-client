export interface VocabularyRequest {
  word: string;
  definition?: string;
  example?: string;
}

export interface VocabularyResponse {
  id: number;
  word: string;
  definition: string;
  example: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type VocabularyPageResponse = PageResponse<VocabularyResponse>;
