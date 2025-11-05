import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import apiClient from '../api/client';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user',
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
      const { accessToken, user: userData } = response.data;

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
      const { accessToken, user: userData } = response.data;

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);

      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
