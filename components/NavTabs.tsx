'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const baseTabs = [
  { href: '/', label: '🛍️ Boutique' },
  { href: '/mes-achats', label: '📚 Mes Achats' },
];

type Props = { isAdmin?: boolean };

export function NavTabs({ isAdmin = false }: Props) {
  const pathname = usePathname();
  const tabs = isAdmin
    ? [...baseTabs, { href: '/admin', label: '⚙️ Admin' }]
    : baseTabs;
  return (
    <nav className="flex flex-wrap gap-3">
      {tabs.map((t) => {
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
