import React from 'react';

export function CalendarCard({ month, date }: { month: string; date: number }) {
  return (
    <div className="flex aspect-square size-12 flex-col items-center rounded-lg shadow-xl">
      <div className="w-full rounded-t-lg bg-red-600 py-0.5 text-center text-xs leading-none font-bold text-white">
        {month}
      </div>
      <div className="flex w-full grow items-center justify-center rounded-b-lg bg-white text-xl leading-none text-black">
        {date}
      </div>
    </div>
  );
}

export default CalendarCard;
