'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle2, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = { user: { email: string; name: string | null } | null };

export function UserMenu({ user }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <Link href="/login" className="btn-primary">
        <LogIn className="h-4 w-4" /> Se connecter
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden items-center gap-2 text-sm font-semibold text-brand md:flex">
        <UserCircle2 className="h-5 w-5" /> {user.name || user.email}
      </span>
      <button onClick={handleSignOut} className="btn-gold">
        <LogOut className="h-4 w-4" /> Déconnexion
      </button>
    </div>
  );
}
