'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface Video {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string | null;
  downloads: Array<{ id: string; name: string; file: string }>;
}

export default function BoutiquePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Fetch videos and purchase info
        const response = await fetch(`/api/videos?email=${encodeURIComponent(user.email)}`);
        if (!response.ok) throw new Error('Erreur lors du chargement');

        const data = await response.json();
        setVideos(data.all_videos);
        setPurchasedIds(new Set(data.purchased_ids));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400">Chargement de la boutique...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Boutique</h1>
            <p className="mt-2 text-slate-400">Formations vidéo pour navigateurs</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-600 hover:text-teal-400"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {videos.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
            <p className="text-slate-400">Aucune vidéo disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const isPurchased = purchasedIds.has(video.id);

              return (
                <div
                  key={video.id}
                  className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition hover:border-teal-600 hover:shadow-lg hover:shadow-teal-600/20"
                >
                  {video.image ? (
                    <div className="relative h-48 w-full bg-slate-900">
                      <Image
                        src={video.image}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      {isPurchased && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <div className="text-center">
                            <div className="mb-2 text-4xl">✓</div>
                            <p className="text-white font-semibold">Acheté</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-900">
                      <div className="text-6xl text-slate-600">🎬</div>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="mb-2 font-semibold text-white">
                      {video.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-400">
                      {video.description?.replace(/<[^>]*>/g, '')}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-teal-400">
                        {video.price}€
                      </span>
                      <span className="text-sm text-slate-500">
                        {video.downloads?.length || 0} fichier(s)
                      </span>
                    </div>

                    {isPurchased ? (
                      <Link
                        href="/videos"
                        className="block w-full rounded-lg bg-teal-600/20 px-4 py-2 text-center font-semibold text-teal-400 transition hover:bg-teal-600/30"
                      >
                        Accéder à la vidéo
                      </Link>
                    ) : (
                      <button className="w-full rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700">
                        Acheter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
