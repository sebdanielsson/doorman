/**
 * Authentication Guard Wrapper Component
 * Wraps pages/components that require authentication
 * Redirects to login if not authenticated
 */

'use client';

import { useAuthGuard } from '@/hooks/use-auth-guard';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  redirectTo = '/login',
  fallback = <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthGuard({ redirectTo });

  // Show loading state while checking authentication
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Don't render children if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default AuthGuard;
