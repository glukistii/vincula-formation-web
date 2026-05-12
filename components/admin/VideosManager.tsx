'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { createVideo, deleteVideo, moveVideo } from '@/app/admin/actions';
import type { CourseVideo } from '@/lib/types';

type Props = {
  productId: number;
  videos: CourseVideo[];
};

function AddBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Plus className="h-4 w-4" /> {pending ? 'Ajout…' : 'Ajouter la vidéo'}
    </button>
  );
}

export function VideosManager({ productId, videos }: Props) {
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="space-y-6">
      {/* Existing videos list */}
      {videos.length > 0 && (
        <ul className="space-y-2">
          {videos.map((v, i) => (
            <li
              key={v.id}
              className="flex flex-wrap items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3"
            >
              <span className="font-mono text-xs text-neutral-500">{String(i + 1).padStart(2, '0')}</span>
              {/* YouTube thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${v.youtube_id}/default.jpg`}
                alt=""
                className="h-10 w-16 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-neutral-900">{v.title}</div>
                <div className="truncate text-xs text-neutral-500">
                  YT: <span className="font-mono">{v.youtube_id}</span>
                  {v.duration_seconds ? ` · ${Math.floor(v.duration_seconds / 60)} min` : ''}
                </div>
              </div>
              {/* Move up */}
              <form action={moveVideo}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="product_id" value={productId} />
                <input type="hidden" name="direction" value="up" />
                <button
                  className="rounded p-1.5 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"
                  disabled={i === 0}
                  aria-label="Monter"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </form>
              {/* Move down */}
              <form action={moveVideo}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="product_id" value={productId} />
                <input type="hidden" name="direction" value="down" />
                <button
                  className="rounded p-1.5 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"
                  disabled={i === videos.length - 1}
                  aria-label="Descendre"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </form>
              {/* Delete */}
              <form action={deleteVideo}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="product_id" value={productId} />
                <button
                  className="rounded p-1.5 text-red-600 hover:bg-red-50"
                  aria-label="Supprimer"
                  onClick={(e) => {
                    if (!confirm(`Supprimer la vidéo "${v.title}" ?`)) e.preventDefault();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* Add new video */}
      <form
        key={formKey}
        action={async (fd) => {
          await createVideo(fd);
          setFormKey((k) => k + 1); // reset the form
        }}
        className="grid gap-3 rounded-md border border-dashed border-neutral-300 bg-white p-4"
      >
        <input type="hidden" name="product_id" value={productId} />
        <div>
          <label className="label">URL YouTube ou ID</label>
          <input
            name="youtube_input"
            required
            className="input font-mono"
            placeholder="https://youtu.be/dQw4w9WgXcQ ou dQw4w9WgXcQ"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Titre du chapitre</label>
            <input name="title" required className="input" placeholder="Chapitre 1 — Introduction" />
          </div>
          <div>
            <label className="label">Durée (secondes, optionnel)</label>
            <input name="duration_seconds" type="number" min={0} className="input" placeholder="180" />
          </div>
        </div>
        <div>
          <label className="label">Description (optionnel)</label>
          <textarea name="description" rows={2} className="input" placeholder="Présentation du chapitre" />
        </div>
        <div>
          <label className="label">Ordre d'affichage</label>
          <input
            name="display_order"
            type="number"
            min={0}
            defaultValue={videos.length}
            className="input w-24"
          />
        </div>
        <div className="flex justify-end">
          <AddBtn />
        </div>
      </form>
    </div>
  );
}
