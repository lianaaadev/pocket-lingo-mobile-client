import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401 Unauthorized - handle token expiration or invalid token
      if (status === 401) {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user');
        // TODO: navigate back to login?
      }

      const errorMessage = data?.message || data?.error || 'An error occurred';
      error.message = errorMessage;
    } else if (error.request) {
      error.message = 'Network error. Please check your connection.';
    } else {
      error.message = 'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
