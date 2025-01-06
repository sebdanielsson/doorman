import { Metadata } from 'next';

import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';
import { Booking } from '@/components/booking';
import { addDays } from 'date-fns';
import { DaySchedule } from '@/types/booking';

export const metadata: Metadata = {
  title: 'Boka bastu',
  description: 'Boka tid i bastun.',
};

// Mock data
const mockSchedule: DaySchedule[] = [
  {
    date: new Date(),
    slots: [
      { start: '10:00', end: '14:00', isAvailable: true },
      { start: '14:00', end: '18:00', isAvailable: true },
    ],
  },
  {
    date: addDays(new Date(), 1),
    slots: [
      { start: '07:00', end: '11:00', isAvailable: true },
      { start: '11:00', end: '14:00', isAvailable: false },
      { start: '14:00', end: '17:00', isAvailable: true },
      { start: '17:00', end: '21:00', isAvailable: true },
    ],
  },

  {
    date: addDays(new Date(), 2),
    slots: [
      { start: '07:00', end: '11:00', isAvailable: true },
      { start: '11:00', end: '14:00', isAvailable: false },
      { start: '14:00', end: '17:00', isAvailable: true },
      { start: '17:00', end: '21:00', isAvailable: true },
    ],
  },

  {
    date: addDays(new Date(), 3),
    slots: [
      { start: '07:00', end: '11:00', isAvailable: true },
      { start: '11:00', end: '14:00', isAvailable: false },
      { start: '14:00', end: '17:00', isAvailable: true },
      { start: '17:00', end: '21:00', isAvailable: true },
    ],
  },

  {
    date: addDays(new Date(), 4),
    slots: [
      { start: '07:00', end: '11:00', isAvailable: true },
      { start: '11:00', end: '14:00', isAvailable: false },
      { start: '14:00', end: '17:00', isAvailable: true },
      { start: '17:00', end: '21:00', isAvailable: true },
    ],
  },

  {
    date: addDays(new Date(), 5),
    slots: [
      { start: '07:00', end: '11:00', isAvailable: true },
      { start: '11:00', end: '14:00', isAvailable: false },
      { start: '14:00', end: '17:00', isAvailable: true },
      { start: '17:00', end: '21:00', isAvailable: true },
    ],
  },
  // Add more days as needed...
];

export default function BookAccountPage() {
  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <h3 className="text-lg font-medium">Bastu</h3>
        <p className="text-sm text-muted-foreground">Boka tid i bastun.</p>
      </div>
      <Separator className="hidden lg:block" />
      <Booking schedule={mockSchedule} />
      <Toaster />
    </div>
  );
}
