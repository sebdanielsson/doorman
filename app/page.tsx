'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MyBookings } from '@/components/my-bookings';
import { Announcements } from '@/components/announcements';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { state } = useAuth();

  // Show login prompt if not authenticated
  if (!state.isAuthenticated && !state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Välkommen till Doorman</h1>
          <p className="text-muted-foreground text-lg">
            Logga in för att komma åt bokningar och funktioner
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/login">Logga in</Link>
        </Button>
      </div>
    );
  }

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium">Laddar...</h1>
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
            <span className="text-lg font-normal text-muted-foreground ml-2">
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
