import Link from 'next/link';
import { ShoppingCart, Check, Play } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

type Props = {
  product: Product;
  isOwned: boolean;
  isLoggedIn: boolean;
};

export function ProductCard({ product, isOwned, isLoggedIn }: Props) {
  const buyHref = product.wc_url ?? '#';
  return (
    <article className="card flex flex-col">
      {product.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image_url}
          alt={product.title}
          className="aspect-square w-full bg-neutral-100 object-cover"
          loading="lazy"
        />
      )}

      <div className="flex flex-1 flex-col p-5">
        {product.badge && (
          <span className="mb-3 inline-block w-fit rounded-md bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {product.badge}
          </span>
        )}
        <h4 className="mb-2 text-base font-bold leading-tight text-neutral-900 font-sans">
          {product.title}
        </h4>
        {product.description && (
          <p className="mb-4 line-clamp-3 text-sm text-neutral-600">{product.description}</p>
        )}

        <div className="mb-4 mt-auto">
          <span className="text-2xl font-bold text-gold">{formatPrice(product.price)}</span>
          {product.price_original && (
            <span className="ml-2 text-sm text-neutral-400 line-through">
              {formatPrice(product.price_original)}
            </span>
          )}
        </div>

        {isOwned ? (
          <Link href="/mes-achats" className="btn w-full bg-emerald-600 text-white hover:bg-emerald-700">
            <Check className="h-4 w-4" /> Acheté — Regarder
          </Link>
        ) : isLoggedIn ? (
          <a
            href={buyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            <ShoppingCart className="h-4 w-4" /> Acheter
          </a>
        ) : (
          <a
            href={buyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            <Play className="h-4 w-4" /> Voir sur le site
          </a>
        )}
      </div>
    </article>
  );
}
