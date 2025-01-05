import { Separator } from '@/components/ui/separator';
import { MyBookings } from '@/components/my-bookings';
import { Announcements } from '@/components/announcements';

export default function Home() {
  return (
    <div className="flex flex-col gap-6 p-10 pb-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Start</h2>
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
    </div>
  );
}
