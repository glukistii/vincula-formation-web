'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CourseVideo, Product } from '@/lib/types';

type Props = {
  product: Product;
  videos: CourseVideo[];
};

export function TVPlayer({ product, videos }: Props) {
  const [idx, setIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const current = videos[idx];

  // Keyboard / D-pad shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (videos.length === 0) return;
      if (e.key === 'ArrowUp') {
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowDown') {
        setIdx((i) => Math.min(videos.length - 1, i + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        setFullscreen((v) => !v);
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        if (fullscreen) {
          setFullscreen(false);
          e.preventDefault();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [videos.length, fullscreen]);

  if (videos.length === 0) {
    return (
      <div className="tv-empty">
        <Link href="/tv" className="tv-cta tv-back" autoFocus>← Retour</Link>
        <div className="tv-empty-emoji">🎬</div>
        <h2 className="tv-heading">{product.title}</h2>
        <p className="tv-sub">
          Aucune vidéo n'est encore associée à cette formation. Reviens bientôt.
        </p>
      </div>
    );
  }

  if (fullscreen) {
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
      current.youtube_id,
    )}?rel=0&modestbranding=1&autoplay=1`;
    return (
      <div className="tv-player">
        <iframe
          src={src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={current.title}
        />
        <button
          onClick={() => setFullscreen(false)}
          className="tv-cta tv-back"
          autoFocus
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          ← Quitter (Échap)
        </button>
      </div>
    );
  }

  return (
    <>
      <Link href="/tv" className="tv-cta tv-back">← Retour</Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 32, marginTop: 24 }}>
        <div>
          <div style={{ aspectRatio: '16/9', background: 'black', borderRadius: 16, overflow: 'hidden' }}>
            <iframe
              key={current.youtube_id}
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(
                current.youtube_id,
              )}?rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={current.title}
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          </div>
          <h1 className="tv-heading" style={{ fontSize: 40, marginTop: 24 }}>
            {current.title}
          </h1>
          <p className="tv-sub" style={{ fontSize: 20 }}>
            {current.description || product.description}
          </p>
          <button
            className="tv-cta"
            onClick={() => setFullscreen(true)}
            autoFocus
            style={{ marginTop: 16 }}
          >
            ▶ Lecture plein écran (OK)
          </button>
        </div>

        <aside>
          <h3 style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            Chapitres
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {videos.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setIdx(i)}
                className="tv-tile"
                style={{
                  aspectRatio: 'auto',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'left',
                  background: i === idx ? '#0D9488' : '#1a2228',
                  borderColor: i === idx ? '#0FAB96' : 'transparent',
                  color: 'white',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ opacity: 0.7, fontFamily: 'ui-monospace, monospace', fontSize: 16 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ flex: 1 }}>{v.title}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
