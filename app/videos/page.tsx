'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface PurchasedVideo {
  id: number;
  title: string;
  description: string;
  downloads: Array<{ id: string; name: string; file: string }>;
}

export default function VideosPage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [videos, setVideos] = useState<PurchasedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PurchasedVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAndVideos() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Fetch all videos and purchased info
        const response = await fetch(`/api/videos?email=${encodeURIComponent(user.email)}`);
        if (!response.ok) throw new Error('Erreur lors du chargement');

        const data = await response.json();

        // Filter to only show purchased videos
        const purchased = data.all_videos.filter((v: any) =>
          data.purchased_ids.includes(v.id)
        );

        setVideos(purchased);
        if (purchased.length > 0) {
          setSelectedVideo(purchased[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndVideos();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400">Chargement de vos vidéos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Mes Vidéos</h1>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-600 hover:text-teal-400"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400 mb-8">
            {error}
          </div>
        )}

        {videos.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
            <div className="mb-4 text-5xl">🎬</div>
            <h2 className="mb-2 text-xl font-semibold text-white">Aucune vidéo achetée</h2>
            <p className="mb-6 text-slate-400">
              Visitez la boutique pour acheter vos premières vidéos de formation
            </p>
            <Link
              href="/boutique"
              className="inline-block rounded-lg bg-teal-600 px-6 py-2 font-semibold text-white transition hover:bg-teal-700"
            >
              Aller à la boutique
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Video Player */}
            <div className="lg:col-span-2">
              {selectedVideo && selectedVideo.downloads && selectedVideo.downloads.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                    <video
                      controls
                      className="w-full rounded-lg bg-black"
                      key={selectedVideo.downloads[0].file}
                    >
                      <source
                        src={selectedVideo.downloads[0].file}
                        type="video/mp4"
                      />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>

                  {/* Video Info */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedVideo.title}
                      </h2>
                      <p className="mt-2 text-slate-400">
                        {selectedVideo.description?.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>

                    {/* Download Links */}
                    {selectedVideo.downloads.length > 1 && (
                      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                        <h3 className="mb-3 font-semibold text-white">Fichiers disponibles</h3>
                        <div className="space-y-2">
                          {selectedVideo.downloads.map((file) => (
                            <a
                              key={file.id}
                              href={file.file}
                              download
                              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-teal-400 transition hover:bg-slate-700"
                            >
                              ⬇️ {file.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
                  <p className="text-slate-400">Aucune vidéo disponible pour cette formation</p>
                </div>
              )}
            </div>

            {/* Sidebar - Video List */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <h3 className="mb-4 font-semibold text-white">Vos formations</h3>
              <div className="space-y-2">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                      selectedVideo?.id === video.id
                        ? 'border-l-2 border-teal-600 bg-slate-700 text-white'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{video.title}</div>
                    <div className="text-xs text-slate-500">
                      {video.downloads?.length || 0} fichier(s)
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
