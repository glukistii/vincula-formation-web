'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (error) {
        setError(`Erreur d'authentification: ${error.message}`);
        return;
      }

      router.refresh();
      router.push(next);
    } catch (err) {
      setLoading(false);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-12 max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">Se connecter</h2>

      <div className="mb-4">
        <label className="label">Email</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          placeholder="votre@email.com"
        />
      </div>

      <div className="mb-6">
        <label className="label">Mot de passe</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
