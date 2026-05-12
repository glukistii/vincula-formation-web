import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { CourseVideo, Product } from '@/lib/types';
import { TVPlayer } from './TVPlayer';

export const dynamic = 'force-dynamic';

export default async function TVWatchPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const id = Number(productId);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/tv');

  // Verify ownership
  const { data: purchase } = await supabase
    .from('purchases')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('product_id', id)
    .eq('status', 'completed')
    .maybeSingle();
  if (!purchase) redirect('/tv');

  const [{ data: product }, { data: videos }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('course_videos')
      .select('*')
      .eq('product_id', id)
      .order('display_order', { ascending: true }),
  ]);

  if (!product) notFound();

  return (
    <TVPlayer
      product={product as Product}
      videos={(videos as CourseVideo[]) ?? []}
    />
  );
}
