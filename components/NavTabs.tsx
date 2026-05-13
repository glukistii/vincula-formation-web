'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const publicTabs = [
  { href: '/', label: '🏠 Accueil' },
];

const authenticatedTabs = [
  { href: '/dashboard', label: '🏠 Dashboard' },
  { href: '/videos', label: '🎬 Mes Vidéos' },
  { href: '/boutique', label: '🛍️ Boutique' },
  { href: '/compte', label: '👤 Mon Compte' },
];

type Props = { isAdmin?: boolean };

export function NavTabs({ isAdmin = false }: Props) {
  const pathname = usePathname();

  // Show authenticated nav if on authenticated pages
  const isAuthenticatedPage = ['/dashboard', '/videos', '/boutique', '/compte'].some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  const tabs = isAuthenticatedPage ? authenticatedTabs : publicTabs;
  const adminTabs = isAdmin ? [{ href: '/admin', label: '⚙️ Admin' }] : [];
  const allTabs = [...tabs, ...adminTabs];

  return (
    <nav className="flex flex-wrap gap-3">
      {allTabs.map((t) => {
        const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn('nav-pill', active ? 'nav-pill-active' : 'nav-pill-inactive')}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
