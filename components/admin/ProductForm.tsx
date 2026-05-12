'use client';

import { useFormStatus } from 'react-dom';
import type { Product } from '@/lib/types';

type Props = {
  product?: Partial<Product>;
  action: (formData: FormData) => Promise<void | { error: string }>;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Enregistrement…' : label}
    </button>
  );
}

export function ProductForm({ product, action }: Props) {
  const isNew = !product?.id;
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">ID (entier — utilise le product_id WooCommerce)</label>
          <input
            name="id"
            type="number"
            min={1}
            required
            defaultValue={product?.id ?? ''}
            className="input font-mono"
            readOnly={!isNew}
          />
        </div>
        <div>
          <label className="label">Slug (URL-friendly, ex: « le-bassin »)</label>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={product?.slug ?? ''}
            className="input font-mono"
            placeholder="le-bassin"
          />
        </div>
      </div>

      <div>
        <label className="label">Titre</label>
        <input
          name="title"
          required
          defaultValue={product?.title ?? ''}
          className="input"
          placeholder="Le Bassin"
        />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ''}
          className="input"
          placeholder="Abord thérapeutique de la sphère pelvienne"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="label">Prix (€)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={product?.price ?? 0}
            className="input"
          />
        </div>
        <div>
          <label className="label">Prix barré (optionnel)</label>
          <input
            name="price_original"
            type="number"
            step="0.01"
            min={0}
            defaultValue={product?.price_original ?? ''}
            className="input"
          />
        </div>
        <div>
          <label className="label">Ordre d'affichage</label>
          <input
            name="display_order"
            type="number"
            min={0}
            defaultValue={product?.display_order ?? 0}
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Catégorie</label>
          <input
            name="category"
            list="categories"
            defaultValue={product?.category ?? ''}
            className="input"
            placeholder="Formations Vidéo"
          />
          <datalist id="categories">
            <option value="Offres Groupées" />
            <option value="Formations Vidéo" />
            <option value="Livres & Ressources" />
          </datalist>
        </div>
        <div>
          <label className="label">Badge (ex: « MEILLEUR PRIX »)</label>
          <input
            name="badge"
            defaultValue={product?.badge ?? ''}
            className="input"
            placeholder="MEILLEUR PRIX"
          />
        </div>
      </div>

      <div>
        <label className="label">URL de l'image (https://…)</label>
        <input
          name="image_url"
          type="url"
          defaultValue={product?.image_url ?? ''}
          className="input"
          placeholder="https://vincula-formation.com/wp-content/uploads/…"
        />
      </div>

      <div>
        <label className="label">URL produit WooCommerce (page d'achat)</label>
        <input
          name="wc_url"
          type="url"
          defaultValue={product?.wc_url ?? ''}
          className="input"
          placeholder="https://www.vincula-formation.com/produit/…"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={product?.is_published ?? true}
          className="h-4 w-4 rounded border-neutral-300 text-brand focus:ring-brand"
        />
        Publier ce produit (visible dans la boutique)
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <SubmitButton label={isNew ? 'Créer le produit' : 'Enregistrer'} />
      </div>
    </form>
  );
}
