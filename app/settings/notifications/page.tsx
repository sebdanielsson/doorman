import { Separator } from '@/components/ui/separator';
import { NotificationsForm } from './notifications-form';

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifikationer</h3>
        <p className="text-sm text-muted-foreground">
          Konfigurera hur du vill ta emot notifikationer.
        </p>
      </div>
      <Separator />
      <NotificationsForm />
    </div>
  );
}
