import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { deleteProduct } from './actions';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const { supabase, profile } = await requireAdmin();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true });

  const { count: videoCount } = await supabase
    .from('course_videos')
    .select('*', { count: 'exact', head: true });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-1 text-3xl font-extrabold">Administration</h2>
          <p className="text-sm text-neutral-600">
            Connecté en tant que <strong>{profile.email}</strong>. {products?.length ?? 0} produit
            {(products?.length ?? 0) > 1 ? 's' : ''}, {videoCount ?? 0} vidéo{(videoCount ?? 0) > 1 ? 's' : ''}.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Nouveau produit
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3 text-right">Prix</th>
              <th className="px-4 py-3 text-center">Ordre</th>
              <th className="px-4 py-3 text-center">Publié</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {((products as Product[]) ?? []).map((p) => (
              <tr key={p.id} className="border-t border-neutral-100 align-middle hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{p.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" className="h-12 w-12 rounded-md object-cover" />
                    )}
                    <div>
                      <div className="font-semibold text-neutral-900">{p.title}</div>
                      <div className="text-xs text-neutral-500">/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.category ?? '—'}</td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                  {formatPrice(p.price)}
                </td>
                <td className="px-4 py-3 text-center text-neutral-500">{p.display_order}</td>
                <td className="px-4 py-3 text-center">
                  {p.is_published ? (
                    <Eye className="mx-auto h-4 w-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="mx-auto h-4 w-4 text-neutral-400" />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-brand hover:text-brand"
                    >
                      <Pencil className="h-3 w-3" /> Éditer
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          if (!confirm(`Supprimer définitivement "${p.title}" ?`)) e.preventDefault();
                        }}
                      >
                        <Trash2 className="h-3 w-3" /> Suppr.
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-neutral-500">
                  Aucun produit. Clique sur « Nouveau produit » pour démarrer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
