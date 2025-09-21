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
      systemname: '',
      username: '',
      password: '',
      timeout: 30,
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
      <div className={cn('flex h-full w-full flex-col items-center justify-center gap-6', className)}>
        <div>Redirecting...</div>
      </div>
    );
  }

  const onSubmit = async (data: LoginCredentialsInput) => {
    setIsSubmitting(true);
    clearError();
    
    try {
      await login({
        systemname: data.systemname,
        username: data.username,
        password: data.password,
        timeout: data.timeout,
      });
      // Navigation will be handled by useAuthRedirect
    } catch (error) {
      const authError = createAuthError(error);
      
      // Set field-specific errors if possible
      if (authError.type === 'INVALID_CREDENTIALS') {
        setError('username', { message: 'Invalid apartment number or password' });
        setError('password', { message: 'Invalid apartment number or password' });
      } else if (authError.type === 'NETWORK') {
        setError('systemname', { message: 'Unable to connect to server' });
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
            {/* Server Address Field */}
            <div className="grid gap-2">
              <Label htmlFor="systemname">Server</Label>
              <Input
                id="systemname"
                type="url"
                placeholder="https://example.com"
                {...register('systemname')}
                aria-invalid={errors.systemname ? 'true' : 'false'}
                disabled={isSubmitting || state.isLoading}
              />
              {errors.systemname && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.systemname.message}
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
            {state.error && (
              <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4" role="alert">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-destructive">
                      {state.error.message || 'Ett fel uppstod'}
                    </h4>
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => {
                          clearError();
                          handleSubmit(onSubmit)();
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Försök igen
                      </Button>
                      <Button
                        onClick={clearError}
                        variant="ghost"
                        size="sm"
                      >
                        Stäng
                      </Button>
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
            >
              {isSubmitting || state.isLoading ? 'Loggar in...' : 'Logga in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
