'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  email: string;
  user_metadata?: {
    full_name: string;
  };
  created_at: string;
  last_sign_in_at: string | null;
}

export default function ComptePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser({
          email: user.email || '',
          user_metadata: user.user_metadata as any,
          created_at: user.created_at || '',
          last_sign_in_at: user.last_sign_in_at || null,
        });
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoadingLogout(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  const fullName = user?.user_metadata?.full_name || 'Non renseigné';
  const createdDate = new Date(user?.created_at || '').toLocaleDateString('fr-FR');
  const lastLogin = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR')
    : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Mon Compte</h1>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-600 hover:text-teal-400"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 mb-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-600/20">
              <div className="text-4xl">👤</div>
            </div>
            <h2 className="text-2xl font-bold text-white">{fullName}</h2>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-slate-400">Email</label>
              <p className="mt-1 text-lg font-medium text-white">{user?.email}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-400">Date d'inscription</label>
                <p className="mt-1 text-lg font-medium text-white">{createdDate}</p>
              </div>
              <div>
                <label className="block text-sm text-slate-400">Dernière connexion</label>
                <p className="mt-1 text-lg font-medium text-white">{lastLogin}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400">Statut</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                <p className="text-lg font-medium text-teal-400">Compte Actif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Actions</h3>

          <Link
            href="/videos"
            className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition hover:border-teal-600 hover:bg-slate-800"
          >
            <span className="font-medium text-white">Voir mes vidéos</span>
            <span className="text-slate-400">→</span>
          </Link>

          <Link
            href="/boutique"
            className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition hover:border-teal-600 hover:bg-slate-800"
          >
            <span className="font-medium text-white">Aller à la boutique</span>
            <span className="text-slate-400">→</span>
          </Link>
        </div>

        {/* Logout Section */}
        <div className="mt-12 border-t border-slate-700 pt-8">
          <h3 className="mb-4 text-lg font-semibold text-white">Zone de Danger</h3>

          {showConfirm ? (
            <div className="rounded-lg border border-red-500 bg-red-500/10 p-6">
              <p className="mb-4 text-red-400">
                Êtes-vous sûr? Vous devrez vous reconnecter après.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleLogout}
                  disabled={loadingLogout}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {loadingLogout ? 'Déconnexion...' : 'Confirmer la déconnexion'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-lg border border-slate-600 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full rounded-lg border border-red-600 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-600/10"
            >
              Se déconnecter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
