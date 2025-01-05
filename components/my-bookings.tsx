import { CalendarCard } from './calendar-card';

const myBookingsList = [
  {
    date: 5,
    fullDate: 'Söndag 5 Jan',
    timeSlotName: 'Tvättpass 1/3 Tork 1',
    startTime: '10:00',
    endTime: '14:00',
    bool: true,
  },
  {
    date: 6,
    fullDate: 'Måndag 6 Jan',
    timeSlotName: 'Tvättpass 2/3 Tork 2',
    startTime: '10:00',
    endTime: '14:00',
  },
];

export function MyBookings() {
  return (
    <>
      {myBookingsList.map((booking) => (
        <div key={booking.fullDate} className="flex items-center gap-2 text-base">
          <div>
            <CalendarCard month={booking.fullDate.split(' ').slice(-1)[0]} date={booking.date} />
          </div>
          <div>
            <p>{booking.timeSlotName}</p>
            <p>
              {booking.startTime} - {booking.endTime}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
