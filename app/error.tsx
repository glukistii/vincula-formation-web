'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mb-6 text-7xl">⚠️</div>
      <h1 className="mb-2 text-3xl font-extrabold">Une erreur est survenue</h1>
      <p className="mb-8 text-sm text-neutral-600">
        {error.message || 'Erreur inattendue.'}
      </p>
      <div className="flex justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          Réessayer
        </button>
        <Link href="/" className="btn-secondary">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
