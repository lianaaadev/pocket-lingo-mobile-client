import { AuthResponse, LoginRequest, RegisterRequest } from '../types';
import apiClient from './client';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    console.log('AuthService login response:', JSON.stringify(response.data, null, 2));
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    console.log('AuthService register response:', JSON.stringify(response.data, null, 2));
    return response.data.data;
  },
};