-- =============================================================================
-- Add admin role + RLS policies for catalog management
-- =============================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Index used by the policies below
create index if not exists profiles_admin_idx on public.profiles(id) where is_admin = true;

-- Helper: SECURITY DEFINER function that returns true if the current user is admin.
-- We wrap the check in a function so policies can call it without recursive RLS.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---- products: admins can also insert / update / delete ----
drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
  for insert with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
  for update using (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

-- ---- course_videos: admins can read all + manage ----
drop policy if exists "course_videos_admin_read" on public.course_videos;
create policy "course_videos_admin_read" on public.course_videos
  for select using (public.is_admin());

drop policy if exists "course_videos_admin_insert" on public.course_videos;
create policy "course_videos_admin_insert" on public.course_videos
  for insert with check (public.is_admin());

drop policy if exists "course_videos_admin_update" on public.course_videos;
create policy "course_videos_admin_update" on public.course_videos
  for update using (public.is_admin());

drop policy if exists "course_videos_admin_delete" on public.course_videos;
create policy "course_videos_admin_delete" on public.course_videos
  for delete using (public.is_admin());

-- =============================================================================
-- HOW TO GRANT ADMIN
-- =============================================================================
-- After your account is created, run this in SQL Editor (replace email):
--
--   update public.profiles set is_admin = true where email = 'you@example.com';
--
-- That's it — you'll now see the "Admin" tab in the app.
-- =============================================================================
