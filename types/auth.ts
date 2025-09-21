/**
 * Authentication Types for Backend Authentication Integration
 * Based on data-model.md entities
 */

export interface AuthenticationState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  token: string | null;
  error: AuthError | null;
}

export interface UserProfile {
  apartmentNumber: string;
  serverAddress: string;
  displayName?: string;
  loginTime: Date;
  expiresAt?: Date;
}

// Alias for compatibility with existing code
export type AuthUser = UserProfile & {
  username: string;
  loginGuid: string;
  systemname: string;
  isAuthenticated: boolean;
};

export interface LoginCredentials {
  systemname: string;
  username: string;
  password: string;
  timeout: number;
}

export interface AuthError {
  type: 'NETWORK' | 'INVALID_CREDENTIALS' | 'SERVER_ERROR' | 'TIMEOUT';
  message: string;
  details?: string;
  retryable: boolean;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserProfile; token: string } }
  | { type: 'LOGIN_ERROR'; payload: AuthError }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'TOKEN_EXPIRED' };

export interface AuthContextValue {
  state: AuthenticationState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface SecureStorage {
  setToken: (token: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  removeToken: () => Promise<void>;
  isAvailable: () => boolean;
}
