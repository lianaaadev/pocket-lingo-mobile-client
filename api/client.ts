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

// === Interceptors === //
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[REQUEST] Token attached to request');
      } else {
        console.warn('[REQUEST] No token found in storage');
      }
      console.log('[REQUEST]', config.method?.toUpperCase(), config.baseURL + config.url);
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

      // 401 Unauthorized - token is invalid/expired/missing
      if (status === 401) {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user');

        const authError = new AuthenticationError(
          data?.message || 'Your session has expired. Please login again.'
        );
        return Promise.reject(authError);
      }

      // 403 Forbidden - authenticated but not authorized
      if (status === 403) {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          const permissionError = new PermissionError(
            data?.message || 'Access denied. Your session may have been invalidated.'
          );
          return Promise.reject(permissionError);
        }
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

// === Custom Errors === //
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export default apiClient;
