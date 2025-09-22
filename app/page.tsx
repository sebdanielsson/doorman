'use client';

import { Separator } from '@/components/ui/separator';
import { MyBookings } from '@/components/my-bookings';
import { Announcements } from '@/components/announcements';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

export default function Home() {
  const { state } = useAuth();

  // Show login prompt if not authenticated
  if (!state.isAuthenticated && !state.isLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-center text-3xl font-bold tracking-tight">Välkommen till Doorman</h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="space-y-2 text-center">
          <Spinner variant="ellipsis" className="h-16" />
        </div>
      </div>
    );
  }

  // Show authenticated dashboard
  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Start
          {state.user && (
            <span className="text-muted-foreground ml-2 text-lg font-normal">
              - Lägenhet {state.user.apartmentNumber}
            </span>
          )}
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium">Mina bokningar</h3>
          <Separator />
        </div>
        <MyBookings />
      </div>
      <div className="flex flex-col gap-0">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium">Tillkännagivanden</h3>
          <Separator />
        </div>
        <Announcements />
      </div>
    </>
  );
}
