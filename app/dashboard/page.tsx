'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string; user_metadata?: { full_name: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Bienvenue, {userName}!
          </h1>
          <p className="text-slate-300">
            Connecté en tant que {user?.email}
          </p>
        </div>

        {/* Main Navigation Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          {/* Mes Vidéos */}
          <Link href="/videos" className="group">
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-6 transition hover:border-teal-600 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-teal-600/20">
              <div className="mb-3 text-5xl">🎬</div>
              <h2 className="text-xl font-bold text-white group-hover:text-teal-400">
                Mes Vidéos
              </h2>
              <p className="mt-2 text-center text-sm text-slate-400">
                Accédez à vos vidéos achetées
              </p>
            </div>
          </Link>

          {/* Boutique */}
          <Link href="/boutique" className="group">
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-6 transition hover:border-teal-600 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-teal-600/20">
              <div className="mb-3 text-5xl">🛍️</div>
              <h2 className="text-xl font-bold text-white group-hover:text-teal-400">
                Boutique
              </h2>
              <p className="mt-2 text-center text-sm text-slate-400">
                Découvrez nos formations
              </p>
            </div>
          </Link>

          {/* Mon Compte */}
          <Link href="/compte" className="group">
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-6 transition hover:border-teal-600 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-teal-600/20">
              <div className="mb-3 text-5xl">👤</div>
              <h2 className="text-xl font-bold text-white group-hover:text-teal-400">
                Mon Compte
              </h2>
              <p className="mt-2 text-center text-sm text-slate-400">
                Gérez votre profil
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Informations Compte</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Statut</span>
              <span className="text-teal-400">Actif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
