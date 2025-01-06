import React from 'react';

export function CalendarCard({ month, date }: { month: string; date: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg size-12 shadow-xl aspect-square">
      <div className="bg-red-600 text-white w-full text-center py-0.5 rounded-t-lg text-xs font-bold leading-none">
        {month}
      </div>
      <div className="flex-grow flex items-center justify-center bg-white w-full text-black text-xl leading-none rounded-b-lg">
        {date}
      </div>
    </div>
  );
}

export default CalendarCard;
