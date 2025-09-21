'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { useAuthRedirect } from '@/hooks/use-auth-guard';
import { loginCredentialsSchema, type LoginCredentialsInput } from '@/lib/auth-validation';
import { createAuthError } from '@/lib/auth-errors';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, state, clearError } = useAuth();
  const { shouldRedirect, isLoading: authLoading } = useAuthRedirect('/');

  const form = useForm<LoginCredentialsInput>({
    resolver: zodResolver(loginCredentialsSchema),
    defaultValues: {
      serverUrl: '',
      username: '',
      password: '',
      timeout: 1200, // Match iOS timeout
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = form;

  // Don't render form if user is already authenticated or should redirect
  if (shouldRedirect || authLoading) {
    return (
      <div
        className={cn('flex h-full w-full flex-col items-center justify-center gap-6', className)}
      >
        <div>Redirecting...</div>
      </div>
    );
  }

  const onSubmit = async (data: LoginCredentialsInput) => {
    setIsSubmitting(true);
    clearError();

    try {
      await login({
        serverUrl: data.serverUrl,
        username: data.username,
        password: data.password,
        timeout: data.timeout,
      });
      // Navigation will be handled by useAuthRedirect
    } catch (error) {
      console.error('Login form error:', error);

      // In development, log additional debug info
      if (process.env.NODE_ENV === 'development') {
        console.group('Login Debug Information');
        console.log('Form data:', data);
        console.log('Error details:', error);
        console.groupEnd();
      }

      const authError = createAuthError(error);

      // Set field-specific errors if possible
      if (authError.type === 'INVALID_CREDENTIALS') {
        setError('username', { message: 'Invalid apartment number or password' });
        setError('password', { message: 'Invalid apartment number or password' });
      } else if (authError.type === 'NETWORK') {
        setError('serverUrl', { message: 'Unable to connect to server' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn('flex h-full w-full flex-col items-center justify-center gap-6', className)}
      {...props}
    >
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Logga in</CardTitle>
          <CardDescription>
            Logga in med ditt tresiffriga lägenhetsnummer och lösenord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Server URL Field */}
            <div className="grid gap-2">
              <Label htmlFor="serverUrl">Server URL</Label>
              <Input
                id="serverUrl"
                type="url"
                placeholder="https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx"
                {...register('serverUrl')}
                aria-invalid={errors.serverUrl ? 'true' : 'false'}
                disabled={isSubmitting || state.isLoading}
              />
              {errors.serverUrl && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.serverUrl.message}
                </p>
              )}
            </div>

            {/* Apartment Number Field */}
            <div className="grid gap-2">
              <Label htmlFor="username">Lägenhetsnummer</Label>
              <Input
                id="username"
                type="text"
                placeholder="001"
                maxLength={3}
                {...register('username')}
                aria-invalid={errors.username ? 'true' : 'false'}
                disabled={isSubmitting || state.isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Lösenord</Label>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
                disabled={isSubmitting || state.isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* General Error Display */}
            {/* Error State */}
            {state.error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-4"
                role="alert"
                aria-live="assertive"
                id="auth-error"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">
                      {state.error.message || 'Ett fel uppstod'}
                    </h4>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => {
                          clearError();
                          handleSubmit(onSubmit)();
                        }}
                        variant="outline"
                        size="sm"
                        aria-label="Försök logga in igen"
                      >
                        Försök igen
                      </Button>
                      <Button
                        onClick={clearError}
                        variant="ghost"
                        size="sm"
                        aria-label="Stäng felmeddelande"
                      >
                        Stäng
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Development Debug Info */}
            {process.env.NODE_ENV === 'development' && state.error && (
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-800">Debug Information</h4>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>
                        <strong>Error Type:</strong> {state.error.type}
                      </p>
                      <p>
                        <strong>Message:</strong> {state.error.message}
                      </p>
                      {state.error.details && (
                        <p>
                          <strong>Details:</strong> {state.error.details}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Check browser console for additional debug information
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || state.isLoading}
              aria-describedby={state.error ? 'auth-error' : undefined}
            >
              {isSubmitting || state.isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                  <span>Loggar in...</span>
                </div>
              ) : (
                'Logga in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
