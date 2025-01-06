'use client'; // This directive ensures the component is treated as a client component

import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';

export default function HeaderWrapper() {
  const pathname = usePathname();

  // Specify all paths where the header should be hidden
  const hiddenPaths = ['/login'];

  if (hiddenPaths.includes(pathname)) {
    return null; // Do not render the header on hidden paths
  }

  return <SiteHeader />;
}
