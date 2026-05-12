// Shared admin guard. Throws (server-side) when the current user is not admin.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/admin');
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_admin')
    .eq('id', user.id)
    .single();
  if (!profile?.is_admin) {
    redirect('/');
  }
  return { user, profile, supabase };
}

/**
 * Tries to extract a YouTube video id from anything the user might paste:
 *   - a plain id ("dQw4w9WgXcQ")
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube-nocookie.com/embed/ID
 * Returns null if no id could be extracted.
 */
export function parseYoutubeId(input: string): string | null {
  const s = (input || '').trim();
  if (!s) return null;
  // Plain id (11 chars, [A-Za-z0-9_-])
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.endsWith('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (u.hostname.endsWith('youtube.com') || u.hostname.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      // /embed/ID  /v/ID  /shorts/ID
      if (parts.length >= 2 && /^[A-Za-z0-9_-]{11}$/.test(parts[1])) return parts[1];
    }
  } catch {
    // Not a URL — fall through.
  }
  return null;
}
