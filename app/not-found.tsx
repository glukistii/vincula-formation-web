import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mb-6 text-7xl">🤔</div>
      <h1 className="mb-2 text-3xl font-extrabold">Page introuvable</h1>
      <p className="mb-8 text-neutral-600">
        Cette page n'existe pas (ou plus). Retourne à la boutique pour explorer nos formations.
      </p>
      <Link href="/" className="btn-primary inline-flex">
        🛍️ Retour à la boutique
      </Link>
    </div>
  );
}
