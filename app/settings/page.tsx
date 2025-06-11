import { Metadata } from 'next';

import { Separator } from '@/components/ui/separator';
import { AccountForm } from './account-form';

export const metadata: Metadata = {
  title: 'Konto - Inställningar',
};

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Konto</h3>
        <p className="text-muted-foreground text-sm">Uppdatera dina kontoinställningar.</p>
      </div>
      <Separator />
      <AccountForm />
    </div>
  );
}
