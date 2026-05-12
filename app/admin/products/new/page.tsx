import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { upsertProduct } from '@/app/admin/actions';
import { ProductForm } from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Retour à l'admin
      </Link>
      <h2 className="mb-6 text-3xl font-extrabold">Nouveau produit</h2>
      <p className="mb-8 text-sm text-neutral-600">
        L'<strong>ID</strong> doit être le même que le <code>product_id</code> sur WooCommerce
        (visible dans WP → Produits → édite le produit, dans l'URL).
      </p>
      <ProductForm action={upsertProduct} />
    </div>
  );
}
