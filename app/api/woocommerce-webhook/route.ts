// =============================================================================
// WooCommerce webhook receiver
// -----------------------------------------------------------------------------
// Listens for `order.created`, `order.updated` and `order.completed` events.
// Validates the HMAC signature (Woo's "Secret" field), then upserts the
// corresponding rows into `purchases` (and creates the profile if needed).
//
// Configure on the WordPress side:
//   WooCommerce → Settings → Advanced → Webhooks → Add webhook
//     - Topic:        Order updated (and a second one for Order created)
//     - Delivery URL: https://<your-app>.vercel.app/api/woocommerce-webhook
//     - Secret:       (paste the same value as WOOCOMMERCE_WEBHOOK_SECRET)
//     - API Version:  WP REST API Integration v3
//
// If WEBHOOK_AUTO_CREATE_USERS=true (default), customers without an app
// account get one created automatically + an invitation email to set their
// password. The invitation email uses Supabase's default template — make
// sure SMTP is configured in Supabase → Settings → Auth → SMTP if you want
// reliable delivery in production.
// =============================================================================
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COMPLETED_STATUSES = new Set(['completed', 'processing']);
const REFUND_STATUSES = new Set(['refunded', 'cancelled', 'failed']);

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type WooLineItem = {
  product_id: number;
  variation_id?: number;
  name: string;
  quantity: number;
  total: string;
};

type WooBilling = {
  email: string;
  first_name?: string;
  last_name?: string;
};

type WooOrder = {
  id: number;
  status: string;
  total: string;
  billing: WooBilling;
  line_items: WooLineItem[];
  customer_id?: number;
};

/**
 * Returns the profile id for the given email, creating the auth user
 * (and corresponding profile, via DB trigger) if it doesn't exist yet.
 * The customer receives an invitation email to set their password.
 */
async function findOrCreateProfile(
  // We type loosely as `any` to avoid forcing Database<>infinite-depth here.
  supabase: ReturnType<typeof createServiceRoleClient>,
  email: string,
  fullName: string | null,
  autoCreate: boolean,
): Promise<{ profileId: string | null; created: boolean; }> {
  // 1. Existing profile?
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existing?.id) return { profileId: existing.id, created: false };

  if (!autoCreate) return { profileId: null, created: false };

  // 2. Invite user. This creates auth.users (the `handle_new_user` trigger
  //    then creates the row in public.profiles) and sends an email.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://vincula-formation-web.vercel.app';

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName ?? '' },
    redirectTo: `${siteUrl}/auth/callback?next=/mes-achats`,
  });
  if (error) {
    // If invite fails (e.g. user already exists in auth but profile missing),
    // try a plain create-user as fallback.
    if (!/already.*exist/i.test(error.message)) {
      console.error('[wc-webhook] invite failed:', error);
    }
    const created = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName ?? '' },
    });
    if (created.error || !created.data.user) {
      // last-resort lookup: list by email
      const list = await supabase.auth.admin.listUsers();
      const match = list.data?.users.find((u) => u.email === email);
      if (match?.id) return { profileId: match.id, created: false };
      console.error('[wc-webhook] create-user failed:', created.error);
      return { profileId: null, created: false };
    }
    return { profileId: created.data.user.id, created: true };
  }

  return { profileId: data?.user?.id ?? null, created: true };
}

export async function POST(request: Request) {
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const raw = await request.text();
  const signature = request.headers.get('x-wc-webhook-signature');

  if (!verifySignature(raw, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let order: WooOrder;
  try {
    order = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!order?.id || !order?.billing?.email) {
    return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
  }

  const email = order.billing.email.toLowerCase().trim();
  const fullName =
    [order.billing.first_name, order.billing.last_name].filter(Boolean).join(' ').trim() || null;
  const supabase = createServiceRoleClient();

  const autoCreate = (process.env.WEBHOOK_AUTO_CREATE_USERS ?? 'true').toLowerCase() !== 'false';

  const { profileId, created } = await findOrCreateProfile(supabase, email, fullName, autoCreate);

  if (!profileId) {
    return NextResponse.json(
      {
        ok: true,
        skipped: true,
        reason: 'no_profile_for_email',
        hint: 'Auto-create is disabled or invitation failed. Ask the customer to register at /register with the same email.',
      },
      { status: 200 },
    );
  }

  // 2. Insert / update purchases
  const isGranting = COMPLETED_STATUSES.has(order.status);
  const isRevoking = REFUND_STATUSES.has(order.status);
  const targetStatus = isGranting ? 'completed' : isRevoking ? 'refunded' : 'pending';

  const rows = order.line_items.map((li) => ({
    user_id: profileId,
    product_id: li.product_id,
    wc_order_id: order.id,
    status: targetStatus as 'completed' | 'refunded' | 'pending',
    amount: parseFloat(li.total) || null,
  }));

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no_line_items' });
  }

  const { error } = await supabase
    .from('purchases')
    .upsert(rows, { onConflict: 'user_id,product_id' });

  if (error) {
    console.error('[wc-webhook] upsert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    processed: rows.length,
    status: targetStatus,
    user_created: created,
  });
}

// Allow Woo to send a quick GET test ping
export async function GET() {
  return NextResponse.json({ ok: true, service: 'woocommerce-webhook' });
}
