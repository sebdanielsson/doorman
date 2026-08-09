/**
 * High-level Authentication Client
 * Coordinates between API routes and secure storage
 * Based on data-model.md and research.md architecture
 */

import type { LoginCredentials, AuthUser } from '@/types/auth';
import { authStorage } from './auth-storage';

/**
 * Authenticate user with credentials
 */
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  try {
    // Make API request to our proxy endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      // Log debug info if available
      if (errorData.debug) {
        console.group('Debug Information');
        console.log('Server URL:', errorData.debug.serverUrl);
        console.log('Username:', errorData.debug.username);
        console.log('Systemname:', errorData.debug.systemname);
        // The SOAP request body is deliberately not logged: it carries the
        // user's password.
        console.log('Response Status:', errorData.debug.responseStatus);
        console.log('Response Body:', errorData.debug.responseBody);
        console.groupEnd();
      }

      throw new Error(errorData.error || 'Login failed');
    }

    const loginData = await response.json();

    if (!loginData.success) {
      throw new Error('Login failed: Invalid response');
    }

    // Create user profile from successful login
    const user: AuthUser = {
      username: loginData.username,
      loginGuid: 'stored-in-cookie', // Token is now in HttpOnly cookie
      systemname: loginData.systemname,
      isAuthenticated: true,
      loginTime: new Date(),
      apartmentNumber: loginData.username, // Username is apartment number
      serverAddress: credentials.serverUrl,
      expiresAt: new Date(Date.now() + authStorage.getTokenExpiryHours() * 60 * 60 * 1000),
    };

    // Store user data locally (token is handled server-side via cookies)
    authStorage.storeUser(user);

    return user;
  } catch (error) {
    // Clear any partial auth data on failure
    authStorage.clearAllAuthData();

    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    throw new Error(`Authentication failed: ${errorMessage}`);
  }
}

/**
 * Log out current user
 */
export async function logout(): Promise<void> {
  try {
    const user = getCurrentUser();

    // If we have a user with server info, notify the server via our API
    if (user?.serverAddress) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serverUrl: user.serverAddress,
          }),
        });
      } catch (error) {
        // Log the error but don't prevent local logout
        console.warn('Server logout failed:', error);
      }
    }
  } finally {
    // Always clear local auth data regardless of server response
    authStorage.clearAllAuthData();
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): AuthUser | null {
  return authStorage.getStoredUser();
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/status');
    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    console.error('Failed to check auth status:', error);
    return false;
  }
}

/**
 * Refresh current session if valid
 */
export async function refreshSession(): Promise<AuthUser | null> {
  const user = getCurrentUser();

  if (user && (await isAuthenticated())) {
    // Extend the session expiry
    authStorage.refreshTokenExpiry(user);
    return authStorage.getStoredUser();
  }

  return null;
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | null {
  // Token is now handled server-side via HttpOnly cookies
  // This function is kept for compatibility but returns null
  // since we can't access HttpOnly cookies from client-side
  return null;
}

/**
 * Check if auth storage is secure
 */
export function isSecureStorage(): boolean {
  return authStorage.isSecureStorage();
}

/**
 * Get session expiry information
 */
export function getSessionInfo(): {
  expiresAt: Date | null;
  isExpired: boolean;
  hoursRemaining: number;
} | null {
  const user = getCurrentUser();

  if (!user?.expiresAt) {
    return null;
  }

  const expiresAt = new Date(user.expiresAt);
  const now = new Date();
  const isExpired = now > expiresAt;
  const hoursRemaining = isExpired ? 0 : (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  return {
    expiresAt,
    isExpired,
    hoursRemaining: Math.max(0, Math.round(hoursRemaining * 100) / 100),
  };
}

/**
 * Initialize auth client (restore session from storage)
 */
export async function initializeAuth(): Promise<AuthUser | null> {
  try {
    const user = getCurrentUser();

    if (user && (await isAuthenticated())) {
      // Check if session is still valid
      const sessionInfo = getSessionInfo();
      if (sessionInfo?.isExpired) {
        // Clear expired session
        authStorage.clearAllAuthData();
        return null;
      }

      return user;
    }

    return null;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    // Clear potentially corrupted auth data
    authStorage.clearAllAuthData();
    return null;
  }
}

/**
 * Unified auth client object for easier importing and testing
 */
export const authClient = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  refreshSession,
  getAuthToken,
  isSecureStorage,
  getSessionInfo,
  initializeAuth,
};
