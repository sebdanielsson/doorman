/**
 * Authentication Guard Hook
 * Provides authentication protection for components and pages
 * Based on research.md React Context pattern and auth-context implementation
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface UseAuthGuardOptions {
  /** Redirect to this path if not authenticated */
  redirectTo?: string;
  /** Don't redirect, just return auth state */
  redirect?: boolean;
  /** Show loading state while checking authentication */
  showLoading?: boolean;
}

interface AuthGuardResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuth>['state']['user'];
  error: ReturnType<typeof useAuth>['state']['error'];
}

/**
 * Hook to guard routes and components that require authentication
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): AuthGuardResult {
  const { redirectTo = '/login', redirect = true, showLoading = true } = options;

  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    // Don't redirect if we're still loading auth state
    if (showLoading && state.isLoading) {
      return;
    }

    // Don't redirect if user is already authenticated
    if (state.isAuthenticated) {
      return;
    }

    // Don't redirect if redirect is disabled
    if (!redirect) {
      return;
    }

    // Redirect to login if not authenticated and not loading
    if (!state.isAuthenticated && !state.isLoading) {
      router.push(redirectTo);
    }
  }, [state.isAuthenticated, state.isLoading, router, redirectTo, redirect, showLoading]);

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    error: state.error,
  };
}

/**
 * Hook that requires authentication and throws if not authenticated
 * Use this for components that should never render without authentication
 */
export function useRequireAuth(): NonNullable<AuthGuardResult['user']> {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    throw new Error('Authentication required. Component should not render without authentication.');
  }

  if (!state.user) {
    throw new Error('User data missing despite being authenticated.');
  }

  return state.user;
}

/**
 * Hook to check if current user has access to a specific resource
 * For now, just checks authentication, but can be extended for role-based access
 */
export function useCanAccess(): {
  canAccess: (resource?: string) => boolean;
  canAccessBooking: () => boolean;
  canAccessSettings: () => boolean;
} {
  const { state } = useAuth();

  const canAccess = (resource?: string): boolean => {
    // For now, all authenticated users can access all resources
    // This can be extended with role-based access control later
    if (!state.isAuthenticated) {
      return false;
    }

    // Add specific resource checks here if needed
    // For example: if (resource === 'admin') return user.isAdmin;

    return true;
  };

  const canAccessBooking = (): boolean => {
    return canAccess('booking');
  };

  const canAccessSettings = (): boolean => {
    return canAccess('settings');
  };

  return {
    canAccess,
    canAccessBooking,
    canAccessSettings,
  };
}

/**
 * Hook to redirect authenticated users away from auth pages
 * Use this on login/register pages to prevent authenticated users from seeing them
 */
export function useAuthRedirect(redirectTo: string = '/'): {
  shouldRedirect: boolean;
  isLoading: boolean;
} {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      router.push(redirectTo);
    }
  }, [state.isAuthenticated, state.isLoading, router, redirectTo]);

  return {
    shouldRedirect: state.isAuthenticated,
    isLoading: state.isLoading,
  };
}
