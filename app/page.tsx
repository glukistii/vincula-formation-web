'use client';

import { useEffect, useState } from 'react';
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

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Fetch videos
        const response = await fetch('/api/videos');
        if (!response.ok) throw new Error('Erreur lors du chargement');

        const data = await response.json();
        setVideos(data.all_videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            Formations Paramédicales en Ligne
          </h1>
          <p className="mb-8 text-lg text-slate-300">
            Accédez à nos vidéos de formation pour kinésithérapeutes, BCMA et podologues
          </p>
          {!loading && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {user ? (
                <>
                  <Link
                    href="/videos"
                    className="rounded-lg bg-teal-600 px-8 py-3 font-semibold text-white transition hover:bg-teal-700"
                  >
                    Mes Vidéos
                  </Link>
                  <Link
                    href="/boutique"
                    className="rounded-lg border border-teal-600 px-8 py-3 font-semibold text-teal-400 transition hover:bg-teal-600/10"
                  >
                    Boutique
                  </Link>
                  <Link
                    href="/compte"
                    className="rounded-lg border border-teal-600 px-8 py-3 font-semibold text-teal-400 transition hover:bg-teal-600/10"
                  >
                    Mon Compte
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="rounded-lg bg-teal-600 px-8 py-3 font-semibold text-white transition hover:bg-teal-700"
                  >
                    Créer un compte
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg border border-teal-600 px-8 py-3 font-semibold text-teal-400 transition hover:bg-teal-600/10"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Videos Grid */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-bold text-white">Formations Disponibles</h2>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="text-slate-300">Chargement des vidéos...</div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {!loading && videos.length === 0 && (
            <div className="text-center text-slate-400">
              Aucune formation disponible pour le moment.
            </div>
          )}

          {!loading && videos.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/login?next=/videos/${video.id}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition hover:border-teal-600 hover:shadow-lg hover:shadow-teal-600/20">
                    {video.image ? (
                      <div className="relative h-48 w-full bg-slate-900">
                        <Image
                          src={video.image}
                          alt={video.title}
                          fill
                          className="object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                          <div className="text-5xl text-white">▶</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-slate-900">
                        <div className="text-6xl text-slate-600">🎬</div>
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="mb-2 font-semibold text-white group-hover:text-teal-400">
                        {video.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-slate-400">
                        {video.description
                          ? video.description.replace(/<[^>]*>/g, '')
                          : 'Formation professionnelle'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-teal-400">
                          {video.price}€
                        </span>
                        <span className="text-sm text-slate-500">
                          {video.downloads?.length || 0} fichier(s)
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
