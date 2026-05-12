'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import type { CourseVideo, Product } from '@/lib/types';

type Item = {
  product: Product;
  videos: CourseVideo[];
  purchasedAt: string;
};

type Props = { items: Item[] };

export function PurchasedExplorer({ items }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<number>(items[0].product.id);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(
    items[0].videos[0]?.id ?? null,
  );

  const selected = items.find((i) => i.product.id === selectedProductId)!;
  const activeVideo =
    selected.videos.find((v) => v.id === selectedVideoId) ?? selected.videos[0];

  function selectProduct(id: number) {
    setSelectedProductId(id);
    const next = items.find((i) => i.product.id === id);
    setSelectedVideoId(next?.videos[0]?.id ?? null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Player + description */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        {activeVideo ? (
          <YouTubePlayer
            videoId={activeVideo.youtube_id}
            title={activeVideo.title}
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand-light text-white">
            <div className="text-center">
              <div className="mb-3 text-6xl">▶️</div>
              <p className="text-sm">
                Aucune vidéo n'est encore associée à <strong>{selected.product.title}</strong>.
              </p>
              <p className="mt-2 text-xs opacity-80">
                Ajoute des entrées dans la table <code>course_videos</code> côté Supabase.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <h3 className="mb-1 text-xl font-bold text-neutral-900 font-sans">
            {activeVideo?.title || selected.product.title}
          </h3>
          {activeVideo?.description || selected.product.description ? (
            <p className="text-sm text-neutral-600">
              {activeVideo?.description || selected.product.description}
            </p>
          ) : null}

          {selected.videos.length > 0 && (
            <div className="mt-6 border-t border-neutral-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Chapitres
              </p>
              <ul className="space-y-2">
                {selected.videos.map((v, i) => (
                  <li key={v.id}>
                    <button
                      onClick={() => setSelectedVideoId(v.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition',
                        v.id === activeVideo?.id
                          ? 'border-brand bg-brand text-white'
                          : 'border-neutral-200 bg-white hover:border-brand hover:bg-brand-50',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-xs opacity-70">{String(i + 1).padStart(2, '0')}</span>
                        {v.title}
                      </span>
                      {v.duration_seconds && (
                        <span className="text-xs opacity-70">
                          {Math.floor(v.duration_seconds / 60)}:
                          {String(v.duration_seconds % 60).padStart(2, '0')}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: my purchased products */}
      <aside className="rounded-xl border border-neutral-200 bg-white p-5 lg:sticky lg:top-5 lg:h-fit">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-500">
          🎬 Mes formations
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {items.map((it) => (
            <button
              key={it.product.id}
              onClick={() => selectProduct(it.product.id)}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-md border-2 transition',
                it.product.id === selectedProductId
                  ? 'border-brand shadow-card-hover'
                  : 'border-neutral-200 hover:border-brand',
              )}
              title={it.product.title}
            >
              {it.product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.product.image_url}
                  alt={it.product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xs text-neutral-500">
                  {it.product.title}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                <span className="text-2xl text-white">▶️</span>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
