import { Metadata } from 'next';

import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Boka bastu',
  description: 'Boka tid i bastun.',
};

export default function BookAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Bastu</h3>
        <p className="text-sm text-muted-foreground">Boka tid i bastun.</p>
      </div>
      <Separator />
    </div>
  );
}
