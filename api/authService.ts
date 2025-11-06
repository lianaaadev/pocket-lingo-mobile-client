import { AuthResponse, LoginRequest, RegisterRequest } from '../types';
import apiClient from './client';
import { AUTH_ENDPOINTS } from './endpoints';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
      console.log('AuthService login response:', JSON.stringify(response.data, null, 2));
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, data);
      console.log('AuthService register response:', JSON.stringify(response.data, null, 2));
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },
};