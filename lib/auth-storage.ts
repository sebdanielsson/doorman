/**
 * Secure Authentication Storage
 * Uses js-cookie for secure, httpOnly-compatible token storage
 * Based on research.md security decisions
 */

import Cookies from 'js-cookie';
import type { AuthUser } from '@/types/auth';

// Cookie configuration constants
const AUTH_TOKEN_KEY = 'auth_token';
const USER_PROFILE_KEY = 'user_profile';
const TOKEN_EXPIRY_HOURS = 24; // 24 hours default session

// Cookie options for secure storage
const SECURE_OPTIONS = {
  httpOnly: false, // Client-side JS needs access for API calls
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const,
  expires: TOKEN_EXPIRY_HOURS / 24, // Convert hours to days for js-cookie
};

/**
 * Store authentication token securely
 */
export function storeAuthToken(token: string): void {
  try {
    Cookies.set(AUTH_TOKEN_KEY, token, SECURE_OPTIONS);
  } catch (error) {
    console.error('Failed to store auth token:', error);
    throw new Error('Could not save authentication token');
  }
}

/**
 * Retrieve authentication token from storage
 */
export function getAuthToken(): string | null {
  try {
    return Cookies.get(AUTH_TOKEN_KEY) || null;
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
}

/**
 * Clear authentication token from storage
 */
export function clearAuthToken(): void {
  try {
    Cookies.remove(AUTH_TOKEN_KEY, {
      secure: SECURE_OPTIONS.secure,
      sameSite: SECURE_OPTIONS.sameSite,
    });
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
}

/**
 * Store user profile data securely
 */
export function storeUser(user: AuthUser): void {
  try {
    const userData = JSON.stringify(user);
    Cookies.set(USER_PROFILE_KEY, userData, SECURE_OPTIONS);
  } catch (error) {
    console.error('Failed to store user data:', error);
    throw new Error('Could not save user profile');
  }
}

/**
 * Retrieve user profile from storage
 */
export function getStoredUser(): AuthUser | null {
  try {
    const userData = Cookies.get(USER_PROFILE_KEY);
    if (!userData) {
      return null;
    }

    const user: AuthUser = JSON.parse(userData);
    
    // Check if token has expired
    if (user.expiresAt && new Date() > new Date(user.expiresAt)) {
      // Clear expired data
      clearUser();
      clearAuthToken();
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    // Clear corrupted data
    clearUser();
    return null;
  }
}

/**
 * Clear user profile from storage
 */
export function clearUser(): void {
  try {
    Cookies.remove(USER_PROFILE_KEY, {
      secure: SECURE_OPTIONS.secure,
      sameSite: SECURE_OPTIONS.sameSite,
    });
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
}

/**
 * Clear all authentication data
 */
export function clearAllAuthData(): void {
  clearAuthToken();
  clearUser();
}

/**
 * Check if storage is using secure settings
 */
export function isSecureStorage(): boolean {
  return SECURE_OPTIONS.secure;
}

/**
 * Get the configured token expiry time in hours
 */
export function getTokenExpiryHours(): number {
  return TOKEN_EXPIRY_HOURS;
}

/**
 * Check if authentication data exists in storage
 */
export function hasStoredAuth(): boolean {
  return !!(getAuthToken() && getStoredUser());
}

/**
 * Refresh token expiry by updating the stored user with new expiry time
 */
export function refreshTokenExpiry(user: AuthUser): void {
  const updatedUser: AuthUser = {
    ...user,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
  };
  storeUser(updatedUser);
}

/**
 * Unified auth storage object for easier importing and testing
 */
export const authStorage = {
  storeAuthToken,
  getAuthToken,
  clearAuthToken,
  storeUser,
  getStoredUser,
  clearUser,
  clearAllAuthData,
  isSecureStorage,
  getTokenExpiryHours,
  hasStoredAuth,
  refreshTokenExpiry,
};
