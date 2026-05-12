import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Product, Purchase } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function TVHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://vincula-formation-web.vercel.app';
    return (
      <div className="tv-login-card">
        <h2>Connecte-toi pour voir tes formations</h2>
        <p>
          Sur ton smartphone ou ton ordinateur, ouvre l'adresse ci-dessous et connecte-toi.
          Reviens ensuite sur cette page TV pour profiter de tes vidéos en grand.
        </p>
        <div className="url">{url.replace(/^https?:\/\//, '')}/login</div>
        <p style={{ marginTop: 32, fontSize: 18 }}>
          Astuce : utilise la même adresse email que sur vincula-formation.com pour retrouver
          automatiquement tes achats.
        </p>
      </div>
    );
  }

  const { data: purchases } = await supabase
    .from('purchases')
    .select('product_id, created_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  const ids = (purchases ?? []).map((p: Pick<Purchase, 'product_id'>) => p.product_id);
  if (ids.length === 0) {
    return (
      <div className="tv-empty">
        <div className="tv-empty-emoji">📭</div>
        <h2 className="tv-heading">Aucune formation pour le moment</h2>
        <p className="tv-sub">
          Tes achats apparaîtront ici une fois validés sur vincula-formation.com.
        </p>
      </div>
    );
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', ids);

  const list = ((products as Product[]) ?? []).sort(
    (a, b) => a.display_order - b.display_order,
  );

  return (
    <>
      <h1 className="tv-heading">Tes formations</h1>
      <p className="tv-sub">{list.length} formation{list.length > 1 ? 's' : ''} prêtes à être visionnées.</p>
      <div className="tv-grid">
        {list.map((p, i) => (
          <Link
            key={p.id}
            href={`/tv/watch/${p.id}`}
            className="tv-tile"
            // First tile is auto-focused on page load for D-pad start.
            autoFocus={i === 0}
          >
            {p.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt={p.title} />
            )}
            <div className="tv-tile-overlay">
              <div className="tv-tile-title">{p.title}</div>
              {p.category && <div className="tv-tile-meta">{p.category}</div>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
