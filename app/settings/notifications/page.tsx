import { Metadata } from 'next';

import { Separator } from '@/components/ui/separator';
import { NotificationsForm } from './notifications-form';

export const metadata: Metadata = {
  title: 'Notifikationer - Inställningar',
};

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifikationer</h3>
        <p className="text-muted-foreground text-sm">
          Konfigurera hur du vill ta emot notifikationer.
        </p>
      </div>
      <Separator />
      <NotificationsForm />
    </div>
  );
}
