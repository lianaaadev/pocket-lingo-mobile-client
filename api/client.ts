import { AUTH_EVENTS, authEvents } from '@/utils/eventEmitter';
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

      if (status === 401 || status === 403) {
        await AsyncStorage.multiRemove(['auth_token', 'user']);
        console.log('[API] Session cleared due to', status);

        authEvents.emit(AUTH_EVENTS.SESSION_EXPIRED);

        const authError = status === 401
          ? new AuthenticationError(data?.message || 'Your session has expired')
          : new PermissionError(data?.message || 'Access denied');

        return Promise.reject(authError);
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
