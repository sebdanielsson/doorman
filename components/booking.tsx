'use client'

import { useState } from 'react'
import { format, addDays, parse, differenceInMinutes } from 'date-fns'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { DaySchedule, TimeSlot } from '@/types/booking'

// Mock data
const mockSchedule: DaySchedule[] = [
    {
        date: new Date(),
        slots: [
            { start: '10:00', end: '14:00', isAvailable: true },
            { start: '14:00', end: '18:00', isAvailable: true },
        ]
    },
    {
        date: addDays(new Date(), 1),
        slots: [

            { start: '07:00', end: '11:00', isAvailable: true },
            { start: '11:00', end: '14:00', isAvailable: false },
            { start: '14:00', end: '17:00', isAvailable: true },
            { start: '17:00', end: '21:00', isAvailable: true },
        ]
    },

    {
        date: addDays(new Date(), 2),
        slots: [

            { start: '07:00', end: '11:00', isAvailable: true },
            { start: '11:00', end: '14:00', isAvailable: false },
            { start: '14:00', end: '17:00', isAvailable: true },
            { start: '17:00', end: '21:00', isAvailable: true },
        ]
    },

    {
        date: addDays(new Date(), 3),
        slots: [

            { start: '07:00', end: '11:00', isAvailable: true },
            { start: '11:00', end: '14:00', isAvailable: false },
            { start: '14:00', end: '17:00', isAvailable: true },
            { start: '17:00', end: '21:00', isAvailable: true },
        ]
    },

    {
        date: addDays(new Date(), 4),
        slots: [

            { start: '07:00', end: '11:00', isAvailable: true },
            { start: '11:00', end: '14:00', isAvailable: false },
            { start: '14:00', end: '17:00', isAvailable: true },
            { start: '17:00', end: '21:00', isAvailable: true },
        ]
    },

    {
        date: addDays(new Date(), 5),
        slots: [

            { start: '07:00', end: '11:00', isAvailable: true },
            { start: '11:00', end: '14:00', isAvailable: false },
            { start: '14:00', end: '17:00', isAvailable: true },
            { start: '17:00', end: '21:00', isAvailable: true },
        ]
    },
    // Add more days as needed...
]

interface BookingSlot extends TimeSlot {
    date: Date;
}

export function Booking() {
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null)
    const { toast } = useToast()

    const handleBooking = () => {
        if (selectedSlot) {
            toast({
                title: "Bokning lyckades",
                description: `Du har bokat: ${new Intl.DateTimeFormat(navigator?.language || 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedSlot.date)} ${selectedSlot.start} - ${selectedSlot.end}.`,
            })
        }
    }

    const calculateSlotWidth = (slot: TimeSlot, daySchedule: DaySchedule) => {
        const dayStart = parse(daySchedule.slots[0].start, 'HH:mm', new Date())
        const dayEnd = parse(daySchedule.slots[daySchedule.slots.length - 1].end, 'HH:mm', new Date())
        const slotStart = parse(slot.start, 'HH:mm', new Date())
        const slotEnd = parse(slot.end, 'HH:mm', new Date())

        const totalMinutes = differenceInMinutes(dayEnd, dayStart)
        const slotMinutes = differenceInMinutes(slotEnd, slotStart)

        return (slotMinutes / totalMinutes) * 100
    }

    const renderDays = () => {
        return mockSchedule.map((day, dayIndex) => (
            <div key={dayIndex} className="mb-4">
                <div className="text-sm font-semibold mb-1">{format(day.date, 'EEE, MMM d')}</div>
                <div className="flex h-12 bg-gray-100 rounded-md overflow-hidde gap-0.5">
                    {day.slots.map((slot, slotIndex) => (
                        <Sheet key={slotIndex}>
                            <SheetTrigger asChild>
                                <button
                                    className={`h-full transition-colors ${slot.isAvailable ? 'bg-green-200 hover:bg-green-300' : 'bg-red-200 cursor-not-allowed'
                                        }`}
                                    style={{ width: `${calculateSlotWidth(slot, day)}%` }}
                                    onClick={() => slot.isAvailable && setSelectedSlot({ ...slot, date: day.date })}
                                    disabled={!slot.isAvailable}
                                >
                                    <span className="text-[10px] sm:text-base text-stone-700 font-bold">{`${slot.start} - ${slot.end}`}</span>
                                </button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Bekräfta bokning</SheetTitle>
                                    <SheetDescription>
                                        Du är påväg att boka tiden:
                                        <br />
                                        {new Intl.DateTimeFormat(navigator?.language || 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(day.date)} {slot.start}- {slot.end}.
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
        ))
    }

    return (
        <div className="w-full">
            {renderDays()}
        </div>
    )
}

