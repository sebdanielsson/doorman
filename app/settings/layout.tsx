import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/sidebar-nav';

const sidebarNavItems = [
  {
    title: 'Konto',
    href: '/settings',
  },
  {
    title: 'Notifikationer',
    href: '/settings/notifications',
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Inställningar</h2>
        <p className="text-muted-foreground">
          Hantera inställningar för ditt konto och notifikationer.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
