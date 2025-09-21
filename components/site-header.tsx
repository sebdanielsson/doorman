'use client';

import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { Icons } from '@/components/icons';
import { MainNav } from '@/components/main-nav';
import { MobileNav } from '@/components/mobile-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { UserInfo } from '@/components/user-info';
import { useAuth } from '@/lib/auth-context';

export function SiteHeader() {
  const { state } = useAuth();

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b px-4 backdrop-blur-sm sm:px-10">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between">
        <MainNav />
        <MobileNav />
        <nav className="flex items-center gap-1">
          {/* Show user info when authenticated */}
          {state.isAuthenticated && <UserInfo />}

          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="flex size-9 items-center justify-center"
          >
            <Icons.gitHub className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
