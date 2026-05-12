import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from '@/components/UserMenu';
import { NavTabs } from '@/components/NavTabs';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName: string | null = null;
  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, is_admin')
      .eq('id', user.id)
      .single();
    profileName = data?.full_name || data?.email?.split('@')[0] || null;
    isAdmin = !!data?.is_admin;
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container-page flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* Using a regular <img> so we don't have to whitelist localhost in next/image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://vincula-formation.com/wp-content/uploads/2025/12/icone-e1767854840484.jpg"
            alt="Vincula"
            className="h-11 w-11 rounded-lg"
          />
          <div>
            <h1 className="text-xl font-extrabold leading-tight font-sans">Vincula Formation</h1>
            <p className="text-xs uppercase tracking-wider text-neutral-500">
              Formations en ligne
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <UserMenu user={user ? { email: user.email!, name: profileName } : null} />
        </div>
      </div>
      <div className="container-page pb-5">
        <NavTabs isAdmin={isAdmin} />
      </div>
    </header>
  );
}
