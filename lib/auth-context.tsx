/**
 * Authentication Context for React Application
 * Provides authentication state management and hooks
 * Based on data-model.md AuthenticationState and research.md React Context pattern
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AuthenticationState, AuthUser, LoginCredentials, AuthError, AuthAction } from '@/types/auth';
import { authClient } from './auth-client';
import { authStorage } from './auth-storage';

// Create the authentication context
const AuthContext = createContext<{
  state: AuthenticationState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
} | null>(null);

// Initial authentication state
const initialState: AuthenticationState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
};

// Authentication state reducer
function authReducer(state: AuthenticationState, action: AuthAction): AuthenticationState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'TOKEN_EXPIRED':
      return {
        ...initialState,
        error: {
          type: 'TIMEOUT',
          message: 'Your session has expired. Please log in again.',
          retryable: true,
        },
      };

    default:
      return state;
  }
}

// Authentication context provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authStorage.getAuthToken();
        const user = authStorage.getStoredUser();

        if (token && user) {
          // Check if token is still valid (not expired)
          if (user.expiresAt && new Date(user.expiresAt) > new Date()) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token },
            });
          } else {
            // Token expired, clear storage
            authStorage.clearAllAuthData();
            dispatch({ type: 'TOKEN_EXPIRED' });
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        authStorage.clearAllAuthData();
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const user = await authClient.login(credentials);
      
      // With HttpOnly cookies, the token is stored server-side
      // We don't need to retrieve it client-side
      const token = 'stored-in-httponly-cookie'; // Placeholder for HttpOnly cookie

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      const authError: AuthError = {
        type: error instanceof Error && error.message.includes('credentials') 
          ? 'INVALID_CREDENTIALS' 
          : error instanceof Error && error.message.includes('network')
          ? 'NETWORK'
          : error instanceof Error && error.message.includes('timeout')
          ? 'TIMEOUT'
          : 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Login failed',
        retryable: true,
      };

      dispatch({
        type: 'LOGIN_ERROR',
        payload: authError,
      });
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const token = authStorage.getAuthToken();
      if (token) {
        await authClient.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with logout even if server call fails
    } finally {
      authStorage.clearAllAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const contextValue = {
    state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Custom hook for authentication guard
export function useAuthGuard() {
  const { state } = useAuth();
  
  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    requireAuth: () => {
      if (!state.isAuthenticated && !state.isLoading) {
        throw new Error('Authentication required');
      }
    },
  };
}

// Custom hook for authenticated user info
export function useAuthUser() {
  const { state } = useAuth();
  
  if (!state.isAuthenticated || !state.user) {
    return null;
  }
  
  return state.user;
}
