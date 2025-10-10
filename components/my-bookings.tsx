'use client';

import { useEffect, useState } from 'react';
import { CalendarCard } from './calendar-card';
import type { BookingItem } from '@/app/api/bookings/route';

export function MyBookings() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bookings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setBookings(data.data.bookings);
        } else {
          throw new Error(data.error || 'Failed to load bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Laddar bokningar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Inga aktiva bokningar</p>
      </div>
    );
  }

  return (
    <>
      {bookings.map((booking) => {
        // Parse the date to extract day and month for CalendarCard
        const bookingDate = new Date(booking.date);
        const day = bookingDate.getDate();
        // Get Swedish month abbreviation
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
        const month = monthNames[bookingDate.getMonth()];

        return (
          <div key={booking.id} className="flex items-center gap-2 text-base">
            <div>
              <CalendarCard month={month} date={day} />
            </div>
            <div>
              <p>{booking.timeSlotName}</p>
              <p className="text-sm text-muted-foreground">{booking.time}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}
