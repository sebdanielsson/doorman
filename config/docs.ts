import { MainNavItem } from '@/types/nav';

export interface DocsConfig {
  mainNav: MainNavItem[];
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: 'Hem',
      href: '/',
    },
    {
      title: 'Boka',
      href: '/book',
    },
    {
      title: 'Inställningar',
      href: '/settings',
    },
  ],
};
