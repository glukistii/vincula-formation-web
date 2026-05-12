import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { upsertProduct } from '@/app/admin/actions';
import { ProductForm } from '@/components/admin/ProductForm';
import { VideosManager } from '@/components/admin/VideosManager';
import type { CourseVideo, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [{ data: product }, { data: videos }] = await Promise.all([
    supabase.from('products').select('*').eq('id', productId).maybeSingle(),
    supabase
      .from('course_videos')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Retour à l'admin
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold">{product.title}</h2>
          <p className="text-sm text-neutral-500">
            ID {product.id} · /{product.slug}
          </p>
        </div>
        {product.wc_url && (
          <a
            href={product.wc_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-brand hover:text-brand"
          >
            <ExternalLink className="h-3 w-3" /> Voir sur WordPress
          </a>
        )}
      </div>

      <section className="mb-12 rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold">Informations produit</h3>
        <ProductForm product={product as Product} action={upsertProduct} />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold">
          Vidéos ({(videos ?? []).length})
        </h3>
        <p className="mb-6 text-sm text-neutral-600">
          Colle l'URL ou l'ID d'une vidéo YouTube (non répertoriée recommandé). Les vidéos sont
          présentées dans l'ordre d'affichage aux acheteurs.
        </p>
        <VideosManager productId={productId} videos={(videos as CourseVideo[]) ?? []} />
      </section>
    </div>
  );
}
