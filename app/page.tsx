import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/ProductCard';
import type { Product, Purchase } from '@/lib/types';

export const revalidate = 60; // re-fetch the catalog every minute

export default async function BoutiquePage() {
  const supabase = await createClient();

  // Catalog: public
  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  // Purchases for the current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let owned = new Set<number>();
  if (user) {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('status', 'completed');
    owned = new Set((purchases ?? []).map((p: Pick<Purchase, 'product_id'>) => p.product_id));
  }

  if (productsErr) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-6 text-red-800">
        Erreur de chargement de la boutique : {productsErr.message}
      </div>
    );
  }

  const list = (products ?? []) as Product[];
  const grouped = list.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category || 'Autres';
    (acc[cat] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-10">
        <h2 className="mb-2 text-3xl font-extrabold text-neutral-900">Boutique Vincula Formation</h2>
        <p className="text-neutral-600">
          Toutes nos formations, vidéos et livres en accès immédiat
        </p>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat} className="mb-12">
          <h3 className="mb-6 border-b-2 border-neutral-200 pb-3 text-xl font-bold text-neutral-900">
            {cat}
          </h3>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isOwned={owned.has(p.id)}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        </section>
      ))}

      {list.length === 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-amber-800">
          Aucun produit publié pour le moment. Vérifie la table <code>products</code> dans Supabase.
        </div>
      )}
    </div>
  );
}
