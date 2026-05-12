'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin, parseYoutubeId } from '@/lib/admin';

// =============================================================================
// Product actions
// =============================================================================

const productSchema = z.object({
  id: z.coerce.number().int().min(1),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, 'lowercase, digits, -'),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().min(0),
  price_original: z.coerce.number().min(0).optional().nullable(),
  category: z.string().max(80).optional(),
  badge: z.string().max(40).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  wc_url: z.string().url().optional().or(z.literal('')),
  is_published: z.coerce.boolean().optional(),
  display_order: z.coerce.number().int().min(0).optional(),
});

function cleanForm(form: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === 'string') {
      const t = v.trim();
      out[k] = t === '' ? null : t;
    }
  }
  // checkbox handling: HTML forms omit unchecked checkboxes, set is_published explicitly
  out.is_published = form.get('is_published') === 'on';
  return out;
}

export async function upsertProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const raw = cleanForm(formData);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  }
  const v = parsed.data;
  const { error } = await supabase.from('products').upsert(
    {
      id: v.id,
      slug: v.slug,
      title: v.title,
      description: v.description ?? null,
      price: v.price,
      price_original: v.price_original ?? null,
      category: v.category ?? null,
      badge: v.badge ?? null,
      image_url: v.image_url || null,
      wc_url: v.wc_url || null,
      is_published: v.is_published ?? true,
      display_order: v.display_order ?? 0,
    },
    { onConflict: 'id' },
  );
  if (error) return { error: error.message };
  revalidatePath('/admin');
  revalidatePath('/');
  redirect(`/admin/products/${v.id}`);
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id)) return { error: 'invalid id' };
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}

// =============================================================================
// Course video actions
// =============================================================================

const videoSchema = z.object({
  product_id: z.coerce.number().int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  youtube_input: z.string().min(1, 'YouTube ID ou URL requis'),
  duration_seconds: z.coerce.number().int().min(0).optional().nullable(),
  display_order: z.coerce.number().int().min(0).optional(),
});

export async function createVideo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = videoSchema.safeParse(cleanForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  }
  const v = parsed.data;
  const youtube_id = parseYoutubeId(v.youtube_input);
  if (!youtube_id) {
    return { error: 'Impossible d\'extraire un ID YouTube valide.' };
  }
  const { error } = await supabase.from('course_videos').insert({
    product_id: v.product_id,
    title: v.title,
    description: v.description ?? null,
    youtube_id,
    duration_seconds: v.duration_seconds ?? null,
    display_order: v.display_order ?? 0,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/products/${v.product_id}`);
  revalidatePath('/mes-achats');
}

export async function deleteVideo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') || '');
  const productId = Number(formData.get('product_id'));
  if (!id) return { error: 'invalid id' };
  const { error } = await supabase.from('course_videos').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/products/${productId}`);
}

export async function moveVideo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') || '');
  const direction = String(formData.get('direction') || '');
  const productId = Number(formData.get('product_id'));
  if (!id || !productId || !['up', 'down'].includes(direction)) {
    return { error: 'invalid params' };
  }

  // Fetch all sibling videos to swap order with the immediate neighbour.
  const { data: list } = await supabase
    .from('course_videos')
    .select('id, display_order')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });

  if (!list) return { error: 'fetch failed' };

  const idx = list.findIndex((v) => v.id === id);
  if (idx === -1) return { error: 'not found' };
  const neighbour = direction === 'up' ? list[idx - 1] : list[idx + 1];
  if (!neighbour) return; // already at edge

  // Swap their display_order values.
  const a = list[idx].display_order;
  const b = neighbour.display_order;
  await supabase.from('course_videos').update({ display_order: b }).eq('id', list[idx].id);
  await supabase.from('course_videos').update({ display_order: a }).eq('id', neighbour.id);

  revalidatePath(`/admin/products/${productId}`);
}
