'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden sm:flex">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <Image
          className="dark:invert"
          src="/doorman.svg"
          alt="Next.js logo"
          width={24}
          height={24}
          priority
        />
        <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        <Link
          href="/"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/' ? 'text-foreground' : 'text-foreground/80',
          )}
        >
          Start
        </Link>
        <Link
          href="/book"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname?.startsWith('/book') ? 'text-foreground' : 'text-foreground/80',
          )}
        >
          Boka
        </Link>
        <Link
          href="/settings"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname?.startsWith('/settings') ? 'text-foreground' : 'text-foreground/80',
          )}
        >
          Inställningar
        </Link>
      </nav>
    </div>
  );
}
