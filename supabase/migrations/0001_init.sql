-- =============================================================================
-- Vincula Formation - Initial schema
-- =============================================================================
-- Tables:
--   profiles       — extra user data (linked 1:1 to auth.users)
--   products       — catalog of formations / livres (mirrored from WooCommerce)
--   course_videos  — video items inside a product (YouTube IDs)
--   purchases     — links a user to a purchased product (one row per purchase)
--
-- Row-Level Security is enabled and policies are set so each user can only
-- read their own purchases and profile. The catalog (products, course_videos)
-- is publicly readable. Writes are reserved for the service role (webhook).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  wp_user_id integer, -- optional, if you sync WordPress user IDs
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles(email);

-- -----------------------------------------------------------------------------
-- products  (mirror of WooCommerce products)
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  -- We use the WooCommerce product ID as primary key for direct mapping
  id integer primary key,
  slug text unique not null,
  title text not null,
  description text,
  short_description text,
  price numeric(10,2) not null default 0,
  price_original numeric(10,2),
  category text,
  badge text,
  image_url text,
  wc_url text, -- direct link to the product page on WordPress
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_published_idx on public.products(is_published);

-- -----------------------------------------------------------------------------
-- course_videos  (videos attached to a product, played from YouTube)
-- -----------------------------------------------------------------------------
create table if not exists public.course_videos (
  id uuid primary key default gen_random_uuid(),
  product_id integer not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  youtube_id text not null,        -- e.g. "dQw4w9WgXcQ"
  duration_seconds integer,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists course_videos_product_idx on public.course_videos(product_id, display_order);

-- -----------------------------------------------------------------------------
-- purchases  (one row per (user, product) that is unlocked)
-- -----------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id integer not null references public.products(id) on delete restrict,
  wc_order_id integer, -- WooCommerce order ID that triggered this purchase
  status text not null default 'completed', -- completed | refunded | pending
  amount numeric(10,2),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists purchases_user_idx on public.purchases(user_id);
create index if not exists purchases_order_idx on public.purchases(wc_order_id);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create a profile when a new auth.users row is inserted
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles      enable row level security;
alter table public.products      enable row level security;
alter table public.course_videos enable row level security;
alter table public.purchases     enable row level security;

-- ---- profiles : a user can read & update only their own profile ----
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- ---- products : everyone can read published products ----
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_published = true);

-- ---- course_videos : only owners of the related product can read videos ----
-- Public users see nothing. Authenticated users see only videos for products they own.
drop policy if exists "course_videos_owner_read" on public.course_videos;
create policy "course_videos_owner_read" on public.course_videos
  for select using (
    exists (
      select 1 from public.purchases p
      where p.user_id = auth.uid()
        and p.product_id = course_videos.product_id
        and p.status = 'completed'
    )
  );

-- ---- purchases : a user can read only their own purchases ----
drop policy if exists "purchases_self_read" on public.purchases;
create policy "purchases_self_read" on public.purchases
  for select using (auth.uid() = user_id);

-- Note: inserts/updates on products, course_videos and purchases are restricted
-- to the service_role key (used by the WooCommerce webhook). The service role
-- bypasses RLS by design, so no policy is needed for it.

-- =============================================================================
-- Seed: catalogue actuel (à synchroniser plus tard avec WooCommerce)
-- =============================================================================
insert into public.products (id, slug, title, description, price, price_original, category, badge, image_url, wc_url, display_order) values
  (1, 'pack-integral', 'Pack Intégral — Vidéos & Bibliographie', '4 modules vidéo + 6 livres + poster + Le bassin', 1249, 1433, 'Offres Groupées', 'MEILLEUR PRIX', 'https://vincula-formation.com/wp-content/uploads/2025/12/icone-e1767854840484.jpg', 'https://www.vincula-formation.com/produit/pack-integral/', 1),
  (2, 'formation-theorique-pack-complet', 'Formation Théorique - Pack Complet', '4 modules vidéo couvrant toute la théorie BCMA', 1000, null, 'Formations Vidéo', 'COMPLET', 'https://vincula-formation.com/wp-content/uploads/2025/12/icone-e1767854840484.jpg', 'https://www.vincula-formation.com/produit/formation-theorique-pack-complet/', 2),
  (3, 'le-bassin', 'Le Bassin', 'Abord thérapeutique de la sphère pelvienne', 10, null, 'Formations Vidéo', null, 'https://vincula-formation.com/wp-content/uploads/2025/12/01_bassin-1024x1024.png', 'https://www.vincula-formation.com/produit/le-bassin/', 3),
  (4, 'module-1-notions-de-base', 'Module 1 - Notions de Base', 'Les fondamentaux essentiels pour débuter', 275, null, 'Formations Vidéo', null, 'https://vincula-formation.com/wp-content/uploads/2025/12/03_module1_notions_de_base-1024x1024.jpg', 'https://www.vincula-formation.com/produit/module-1-notions-de-base/', 4),
  (5, 'module-2-chaines-al-pl', 'Module 2 - Chaînes AL & PL', 'Antéro-latérales et Postéro-latérales', 275, null, 'Formations Vidéo', null, 'https://vincula-formation.com/wp-content/uploads/2025/12/04_module2_AL_PL-1024x1024.png', 'https://www.vincula-formation.com/produit/module-2-chaines-al-pl/', 5),
  (6, 'module-3-chaines-am-pm', 'Module 3 - Chaînes AM & PM', 'Antéro-médianes et Postéro-médianes', 275, null, 'Formations Vidéo', null, 'https://vincula-formation.com/wp-content/uploads/2025/12/05_module3_AM_PM-1-1024x1024.jpg', 'https://www.vincula-formation.com/produit/module-3-chaines-am-pm/', 6),
  (7, 'module-4-chaines-pa-ap', 'Module 4 - Chaînes PA/AP', 'Postéro-antérieures et Antéro-postérieures', 275, null, 'Formations Vidéo', null, 'https://vincula-formation.com/wp-content/uploads/2025/12/06_module4_PA_AP-1-1024x1024.jpg', 'https://www.vincula-formation.com/produit/module-4-chaines-pa-ap/', 7),
  (8, 'pack-bibliographie-complet', 'Pack Bibliographie Complet', '6 livres essentiels + poster anatomique', 288, null, 'Livres & Ressources', 'COMPLET', 'https://vincula-formation.com/wp-content/uploads/2026/01/1-NDB-2-723x1024.jpg', 'https://www.vincula-formation.com/produit/pack-bibliographie-complet/', 8),
  (9, 'chaines-notions-de-base', 'Les Chaînes: Notions de Base', 'Socle fondamental de la méthode GDS', 48, null, 'Livres & Ressources', null, 'https://vincula-formation.com/wp-content/uploads/2026/01/1-NDB-2-723x1024.jpg', 'https://www.vincula-formation.com/produit/chaines-notions-de-base/', 9),
  (10, 'chaines-antero-laterales', 'Les Chaînes Antéro-Latérales', 'Chaînes AL pour les praticiens', 48, null, 'Livres & Ressources', null, 'https://vincula-formation.com/wp-content/uploads/2026/01/Les-chaines-Antero-Laterales-A.L.webp', 'https://www.vincula-formation.com/produit/chaines-antero-laterales/', 10),
  (11, 'chaines-postero-laterales', 'Les Chaînes Postéro-Latérales', 'Chaînes PL pour les praticiens', 48, null, 'Livres & Ressources', null, 'https://vincula-formation.com/wp-content/uploads/2026/01/Icone-PL--695x1024.webp', 'https://www.vincula-formation.com/produit/chaines-postero-laterales/', 11),
  (12, 'respir-actions', 'Respir-Actions', 'Guide complet de la respiration', 60, null, 'Livres & Ressources', null, 'https://vincula-formation.com/wp-content/uploads/2026/01/Respir-Actions.webp', 'https://www.vincula-formation.com/produit/respir-actions/', 12),
  (13, 'poster-anatomique', 'Poster Anatomique - Chaînes Musculaires', 'Poster 50×70cm (vues face & dos)', 35, null, 'Livres & Ressources', null, 'https://vincula-formation.com/wp-content/uploads/2025/12/posters_visual-1024x706.png', 'https://www.vincula-formation.com/produit/poster-anatomique/', 13)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  price_original = excluded.price_original,
  category = excluded.category,
  badge = excluded.badge,
  image_url = excluded.image_url,
  wc_url = excluded.wc_url,
  display_order = excluded.display_order;
