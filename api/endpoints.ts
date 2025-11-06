const API_PREFIX = '/api';

// === Auth Endpoints === //
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIX}/auth/login`,
  REGISTER: `${API_PREFIX}/auth/register`,
} as const;

// === Vocabulary Endpoints === //
export const VOCABULARY_ENDPOINTS = {
  BASE: `${API_PREFIX}/vocabulary`,
} as const;

export const getVocabularyByIdUrl = (id: number) => `${VOCABULARY_ENDPOINTS.BASE}/${id}`;