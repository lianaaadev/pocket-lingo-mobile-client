import {
  VocabularyPageResponse,
  VocabularyRequest,
  VocabularyResponse,
} from '@/types/vocabulary.types';
import apiClient from './client';
import { VOCABULARY_ENDPOINTS, getVocabularyByIdUrl } from './endpoints';

export const vocabularyService = {
  getVocabulary: async (page: number = 0, size: number = 20): Promise<VocabularyPageResponse> => {
    try {
      const response = await apiClient.get<VocabularyPageResponse>(VOCABULARY_ENDPOINTS.BASE, {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch vocabulary. ' + (error.response?.data?.message || error));
    }
  },

  getVocabularyById: async (id: number): Promise<VocabularyResponse> => {
    try {
      const response = await apiClient.get<VocabularyResponse>(getVocabularyByIdUrl(id));
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch vocabulary item. ' + (error.response?.data?.message || error));
    }
  },

  createVocabulary: async (data: VocabularyRequest): Promise<VocabularyResponse> => {
    try {
      const response = await apiClient.post<VocabularyResponse>(VOCABULARY_ENDPOINTS.BASE, data);
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to create vocabulary item. ' + (error.response?.data?.message || error));
    }
  },

  updateVocabulary: async (
    id: number,
    data: VocabularyRequest
  ): Promise<VocabularyResponse> => {
    try {
      const response = await apiClient.put<VocabularyResponse>(getVocabularyByIdUrl(id), data);
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to update vocabulary item. ' + (error.response?.data?.message || error));
    }
  },

  deleteVocabulary: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(getVocabularyByIdUrl(id));
    } catch (error: any) {
      throw new Error('Failed to delete vocabulary item. ' + (error.response?.data?.message || error));
    }
  },
};
