import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PurchasedExplorer } from '@/components/PurchasedExplorer';
import type { CourseVideo, Product, Purchase } from '@/lib/types';

export const dynamic = 'force-dynamic';

type PurchaseRow = Pick<Purchase, 'product_id' | 'created_at' | 'amount' | 'wc_order_id'>;

export default async function MesAchatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/mes-achats');
  }

  // 1. purchases of this user
  const { data: purchases } = await supabase
    .from('purchases')
    .select('product_id, created_at, amount, wc_order_id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  const productIds = (purchases ?? []).map((p: PurchaseRow) => p.product_id);

  if (productIds.length === 0) {
    return (
      <div>
        <h2 className="mb-2 text-3xl font-extrabold">Mes Formations</h2>
        <p className="mb-8 text-neutral-600">
          Vos formations achetées apparaîtront ici dès qu'une commande sera confirmée.
        </p>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-10 text-center">
          <div className="mb-4 text-5xl">📭</div>
          <p className="mb-6 text-neutral-700">
            Vous n'avez pas encore de formation. Découvrez le catalogue.
          </p>
          <Link href="/" className="btn-primary inline-flex">
            🛍️ Voir la boutique
          </Link>
        </div>
      </div>
    );
  }

  // 2. corresponding products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  // 3. videos for those products (RLS will filter unowned ones, but we own them all)
  const { data: videos } = await supabase
    .from('course_videos')
    .select('*')
    .in('product_id', productIds)
    .order('display_order', { ascending: true });

  const productsById = new Map<number, Product>(
    ((products as Product[]) ?? []).map((p) => [p.id, p]),
  );
  const videosByProduct = new Map<number, CourseVideo[]>();
  for (const v of (videos as CourseVideo[]) ?? []) {
    if (!videosByProduct.has(v.product_id)) videosByProduct.set(v.product_id, []);
    videosByProduct.get(v.product_id)!.push(v);
  }

  const enriched = (purchases ?? []).map((p: PurchaseRow) => ({
    product: productsById.get(p.product_id)!,
    videos: videosByProduct.get(p.product_id) ?? [],
    purchasedAt: p.created_at,
  })).filter((x) => x.product);

  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-extrabold">Mes Formations</h2>
        <p className="text-neutral-600">
          {enriched.length} formation{enriched.length > 1 ? 's' : ''} débloquée
          {enriched.length > 1 ? 's' : ''}.
        </p>
      </div>

      <PurchasedExplorer items={enriched} />
    </div>
  );
}
