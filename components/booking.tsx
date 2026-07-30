'use client';

import { useState } from 'react';
import { parse, differenceInMinutes } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { DaySchedule, TimeSlot } from '@/types/booking';

interface BookingSlot extends TimeSlot {
  date: Date;
}

interface BookingProps {
  schedule: DaySchedule[];
}

export function Booking({ schedule }: BookingProps) {
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

  const handleBooking = () => {
    if (selectedSlot) {
      toast.add({
        title: 'Bokning lyckades',
        description: `Du har bokat: ${new Intl.DateTimeFormat(navigator?.language || 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedSlot.date)} ${selectedSlot.start} - ${selectedSlot.end}.`,
      });
    }
  };

  const calculateSlotWidth = (slot: TimeSlot, daySchedule: DaySchedule) => {
    const dayStart = parse(daySchedule.slots[0].start, 'HH:mm', new Date());
    const dayEnd = parse(daySchedule.slots[daySchedule.slots.length - 1].end, 'HH:mm', new Date());
    const slotStart = parse(slot.start, 'HH:mm', new Date());
    const slotEnd = parse(slot.end, 'HH:mm', new Date());

    const totalMinutes = differenceInMinutes(dayEnd, dayStart);
    const slotMinutes = differenceInMinutes(slotEnd, slotStart);

    return (slotMinutes / totalMinutes) * 100;
  };

  const renderDays = () => {
    return schedule.map((day, dayIndex) => (
      <div key={dayIndex} className="mb-4">
        <div className="mb-1 text-sm font-semibold">
          {new Intl.DateTimeFormat(navigator?.language || 'en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
          }).format(day.date)}
        </div>
        <div className="overflow-hidde flex h-12 gap-0.5 rounded-md bg-gray-100 dark:bg-zinc-900">
          {day.slots.map((slot, slotIndex) => (
            <Sheet key={slotIndex}>
              <SheetTrigger
                className={`h-full transition-colors ${
                  slot.isAvailable
                    ? 'bg-green-300 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-600'
                    : 'cursor-not-allowed bg-red-400 dark:bg-red-900'
                }`}
                style={{ width: `${calculateSlotWidth(slot, day)}%` }}
                onClick={() => slot.isAvailable && setSelectedSlot({ ...slot, date: day.date })}
                disabled={!slot.isAvailable}
              >
                <span className="text-[10px] font-bold text-stone-800 sm:text-base dark:text-stone-100">{`${slot.start} - ${slot.end}`}</span>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Bekräfta bokning</SheetTitle>
                  <SheetDescription>
                    Du är påväg att boka tiden:
                    <br />
                    {new Intl.DateTimeFormat(navigator?.language || 'en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    }).format(day.date)}{' '}
                    {slot.start}- {slot.end}.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  <Button onClick={handleBooking} className="w-full">
                    Bekräfta bokning
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </div>
    ));
  };

  return <div className="w-full">{renderDays()}</div>;
}
