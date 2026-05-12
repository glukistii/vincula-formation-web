'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">Créer un compte</h2>

      <div className="mb-6 space-y-4">
        <p className="text-sm text-neutral-700">
          Pour créer un compte et accéder à nos formations, veuillez vous inscrire sur notre <strong>boutique principale</strong>.
        </p>
        <p className="text-sm text-neutral-700">
          Une fois votre compte créé sur le site, vous pourrez vous connecter ici avec vos identifiants WordPress.
        </p>
      </div>

      <a
        href="https://vincula-formation.com/inscription"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full inline-block text-center"
      >
        Aller à la Boutique →
      </a>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
