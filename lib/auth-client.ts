/**
 * High-level Authentication Client
 * Coordinates between SOAP client and secure storage
 * Based on data-model.md and research.md architecture
 */

import type { LoginCredentials, AuthUser } from '@/types/auth';
import type { LoginResponse } from '@/types/soap';
import { soapClient } from './soap-client';
import { authStorage } from './auth-storage';

/**
 * Authenticate user with credentials
 */
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  try {
    // Convert LoginCredentials to LoginRequest format for SOAP
    const soapCredentials = {
      systemname: credentials.systemname,
      username: credentials.username,
      Password: credentials.password, // Note: Capital P as per SOAP spec
      timeout: credentials.timeout,
    };

    // Make SOAP login request
    const loginResponse: LoginResponse = await soapClient.login(soapCredentials);
    
    if (!loginResponse.LoginResult) {
      throw new Error('Invalid login response: missing LoginResult');
    }

    // Create user profile from successful login
    const user: AuthUser = {
      username: credentials.username,
      loginGuid: loginResponse.LoginResult,
      systemname: credentials.systemname,
      isAuthenticated: true,
      loginTime: new Date(),
      apartmentNumber: credentials.username, // Username is apartment number
      serverAddress: credentials.systemname,
      expiresAt: new Date(Date.now() + authStorage.getTokenExpiryHours() * 60 * 60 * 1000),
    };

    // Store authentication data securely
    authStorage.storeAuthToken(loginResponse.LoginResult);
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
    const token = authStorage.getAuthToken();
    
    // If we have a valid token, notify the server
    if (token) {
      try {
        await soapClient.logout(token);
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
export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  const token = authStorage.getAuthToken();
  
  return !!(user?.isAuthenticated && token);
}

/**
 * Refresh current session if valid
 */
export function refreshSession(): AuthUser | null {
  const user = getCurrentUser();
  
  if (user && isAuthenticated()) {
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
  return authStorage.getAuthToken();
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
export function initializeAuth(): AuthUser | null {
  try {
    const user = getCurrentUser();
    
    if (user && isAuthenticated()) {
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
