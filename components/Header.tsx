import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from '@/components/UserMenu';
import { NavTabs } from '@/components/NavTabs';

export async function Header() {
  let user = null;
  let profileName: string | null = null;
  let isAdmin = false;

  try {
    const supabase = await createClient();

    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('[Header] Auth error:', authError);
      } else if (authUser) {
        user = authUser;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email, is_admin')
            .eq('id', authUser.id)
            .single();

          if (error) {
            console.error('[Header] Profile query error:', error);
          } else if (data) {
            profileName = data.full_name || data.email?.split('@')[0] || null;
            isAdmin = !!data.is_admin;
          }
        } catch (profileError) {
          console.error('[Header] Profile fetch exception:', profileError);
        }
      }
    } catch (authCheckError) {
      console.error('[Header] Auth check exception:', authCheckError);
    }
  } catch (supabaseError) {
    console.error('[Header] Supabase client error:', supabaseError);
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container-page flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
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
