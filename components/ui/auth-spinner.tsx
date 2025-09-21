/**
 * Authentication Loading Spinner Component
 * Shows loading states during authentication operations
 * Based on Radix UI patterns and accessibility requirements
 */

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AuthSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function AuthSpinner({ 
  className, 
  size = 'md', 
  text = 'Loading...', 
  showText = true 
}: AuthSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 
        className={cn('animate-spin', sizeClasses[size])} 
        aria-hidden="true"
      />
      {showText && (
        <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * Full-screen authentication loading overlay
 */
export function AuthLoadingOverlay({ 
  text = 'Authenticating...' 
}: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 shadow-lg">
        <AuthSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * Inline authentication status indicator
 */
export function AuthStatusSpinner({ 
  isLoading, 
  isSuccess, 
  text 
}: { 
  isLoading: boolean; 
  isSuccess?: boolean; 
  text?: string; 
}) {
  if (!isLoading && !isSuccess) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {isSuccess && !isLoading && (
        <div className="h-4 w-4 rounded-full bg-green-500" aria-hidden="true" />
      )}
      {text && (
        <span className="text-muted-foreground" role="status" aria-live="polite">
          {text}
        </span>
      )}
    </div>
  );
}

export default AuthSpinner;
