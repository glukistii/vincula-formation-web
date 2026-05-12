# Vincula Formation — App Next.js

Refonte de l'app `vincula-formation-web` en **Next.js 15 + TypeScript + Tailwind + Supabase + PWA**.

Cette app affiche la boutique, gère l'authentification, et donne accès aux vidéos YouTube des formations achetées. **Les paiements ne se font pas dans l'app** — les clients sont redirigés vers `vincula-formation.com` (WooCommerce). Un webhook WooCommerce synchronise ensuite les achats vers Supabase pour débloquer l'accès.

---

## Architecture en deux phrases

1. **Frontend Next.js (App Router)** : pages serveur qui lisent le catalogue et les achats depuis Supabase, plus quelques composants client pour l'auth, la navigation et le lecteur vidéo.
2. **Backend** : Supabase (Postgres + Auth) pour la donnée, route `/api/woocommerce-webhook` (Node runtime) pour recevoir les commandes WC en temps réel.

```
┌─────────────────┐    achat     ┌──────────────────┐
│ vincula-        │ ───────────► │ WooCommerce      │
│ formation.com   │              │ (WordPress)      │
└─────────────────┘              └────────┬─────────┘
                                          │ webhook (HMAC signé)
                                          ▼
                          ┌──────────────────────────┐
                          │ Next.js /api/woo…webhook │
                          └────────┬─────────────────┘
                                   │ upsert
                                   ▼
                          ┌──────────────────────────┐
                          │ Supabase (purchases)     │
                          └────────┬─────────────────┘
                                   │ RLS-filtered read
                                   ▼
                          ┌──────────────────────────┐
                          │ App Next.js (l'utilisateur│
                          │ regarde ses vidéos YT)   │
                          └──────────────────────────┘
```

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 3.4** pour le styling
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`)
- **lucide-react** pour les icônes
- **zod** pour la validation (préparé pour usage futur)
- **PWA** : manifest + service worker (sans dépendance externe)

---

## Installation locale

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# puis édite .env.local avec tes vraies clés (voir section ci-dessous)

# 3. Lancer en dev
npm run dev
# → http://localhost:3000
```

---

## Configuration des variables d'environnement

Toutes dans `.env.local` :

| Variable | Où la trouver | Visible côté navigateur ? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | ✅ oui (préfixe `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` / `public` key | ✅ oui — c'est OK car RLS est activée |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` key | ❌ **JAMAIS** — server-only |
| `WOOCOMMERCE_WEBHOOK_SECRET` | À définir dans WP (voir plus bas) | ❌ server-only |
| `NEXT_PUBLIC_WP_URL` | `https://www.vincula-formation.com` | ✅ |
| `NEXT_PUBLIC_SITE_URL` | URL de l'app (en local : `http://localhost:3000`) | ✅ |

---

## Mise en place de Supabase

1. Va sur https://supabase.com/dashboard/project/<projet>/sql/new.
2. Copie-colle le contenu de `supabase/migrations/0001_init.sql` et exécute-le.
3. Vérifie dans **Table Editor** que les tables `profiles`, `products`, `course_videos`, `purchases` existent.
4. Dans **Authentication → Providers**, active **Email** (Password). Désactive « Confirm email » si tu veux que les comptes soient utilisables immédiatement (sinon les utilisateurs reçoivent un email de confirmation).
5. Dans **Authentication → URL Configuration**, ajoute ces URLs comme « Site URL » et « Redirect URLs » :
   - `http://localhost:3000`
   - `https://<ton-app>.vercel.app`
   - `https://<ton-app>.vercel.app/auth/callback`

Les 13 produits actuels sont **insérés automatiquement** par la migration. Tu peux les modifier/supprimer dans **Table Editor → products**.

---

## Mise en place du webhook WooCommerce

1. Sur ton WP, va dans **WooCommerce → Réglages → Avancé → Webhooks → Ajouter un webhook**.
2. Remplis :
   - **Nom** : Vincula Next.js — orders
   - **Statut** : Actif
   - **Sujet** : `Order updated` (créer aussi un second webhook avec `Order created`)
   - **URL de livraison** : `https://<ton-app>.vercel.app/api/woocommerce-webhook`
   - **Secret** : génère une chaîne aléatoire longue (≥ 32 caractères). Copie-la dans `WOOCOMMERCE_WEBHOOK_SECRET` côté Vercel.
   - **Version API** : `WP REST API Integration v3`
3. Enregistre.

**Test rapide** : passe une commande test sur WP, valide-la, puis vérifie dans Supabase (**Table Editor → purchases**) qu'une ligne est apparue.

⚠️ Le webhook ne débloque l'accès que si l'utilisateur a déjà un compte dans l'app avec le **même email** que sur WP. S'il n'a pas encore de compte, le webhook répond `skipped: no_profile_for_email` et tu peux soit (a) inviter le client à créer un compte dans l'app, soit (b) ajouter `supabase.auth.admin.createUser` dans le webhook (voir commentaires dans `app/api/woocommerce-webhook/route.ts`).

---

## Déploiement Vercel

1. Connecte le repo GitHub à Vercel (Import Project).
2. Dans **Project Settings → Environment Variables**, ajoute toutes les variables de `.env.example` (sans le `NEXT_PUBLIC_SITE_URL=http://localhost:3000` — mettre l'URL de prod).
3. Déploie.

Pas de configuration spéciale — Next.js 15 est détecté automatiquement.

---

## Ajouter une vidéo YouTube à un produit

Pour qu'une formation soit jouable, il faut associer au moins une vidéo YouTube au `product_id` correspondant. Dans Supabase **SQL Editor** :

```sql
insert into public.course_videos (product_id, title, description, youtube_id, display_order)
values
  (4, 'Introduction', 'Présentation du module 1', 'dQw4w9WgXcQ', 1),
  (4, 'Chapitre 1 — Anatomie', 'Les bases', 'aBcDeFgHiJk', 2);
```

Le `youtube_id` est la partie après `?v=` dans l'URL YouTube.

Astuce : règle tes vidéos sur **« Non répertorié »** (Unlisted) dans YouTube Studio pour qu'elles ne soient pas indexées, mais restent embedable.

---

## Structure du projet

```
.
├── app/
│   ├── layout.tsx              # layout racine (header, footer, fonts, SW)
│   ├── page.tsx                # / → Boutique
│   ├── login/page.tsx          # /login
│   ├── register/page.tsx       # /register
│   ├── mes-achats/page.tsx     # /mes-achats (protégée)
│   ├── auth/callback/route.ts  # callback email magic-link / confirm
│   └── api/
│       ├── health/route.ts             # /api/health (diagnostic)
│       ├── auth/signout/route.ts        # /api/auth/signout (fallback)
│       └── woocommerce-webhook/route.ts # /api/woocommerce-webhook
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── NavTabs.tsx
│   ├── UserMenu.tsx
│   ├── ProductCard.tsx
│   ├── PurchasedExplorer.tsx
│   ├── YouTubePlayer.tsx
│   └── ServiceWorkerRegister.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient
│   │   ├── server.ts           # createServerClient + service role
│   │   └── middleware.ts       # session refresh
│   ├── types.ts                # types DB
│   └── utils.ts                # cn(), formatPrice()
├── middleware.ts               # rafraîchit la session sur chaque requête
├── supabase/migrations/0001_init.sql
└── public/
    ├── manifest.webmanifest
    ├── sw.js
    └── icons/                  # icônes PWA à générer
```

---

## Sécurité

- La clé `anon` exposée côté client est **safe** : toutes les tables ont la RLS activée, et les politiques limitent l'accès (chacun ne voit que ses purchases / son profile).
- La clé `service_role` n'est utilisée que dans la route webhook, qui vérifie la signature HMAC de WooCommerce avant tout `upsert`.
- Les vidéos YouTube non-listées ne sont **pas réellement protégées** — quiconque a l'URL ou inspecte l'iframe peut la partager. Si la lutte anti-piratage devient critique, migrer vers Bunny Stream / Mux / Vimeo Pro avec des URLs signées.

---

## Interface admin (`/admin`)

Réservée aux utilisateurs marqués `is_admin = true` dans la table `profiles`. Permet de :

- Créer, éditer, publier/dépublier, supprimer des produits du catalogue
- Ajouter des vidéos YouTube à un produit (en collant l'URL — l'ID est extrait automatiquement)
- Réordonner les chapitres (boutons ⬆/⬇) et les supprimer
- Définir un prix barré, un badge, un ordre d'affichage, etc.

Pour devenir admin la première fois, exécute dans Supabase SQL Editor (après ta première connexion à l'app) :

```sql
update public.profiles set is_admin = true where email = 'ton@email.com';
```

Une fois admin, un onglet « ⚙️ Admin » apparaît dans la navigation.

Les permissions sont vérifiées côté serveur (`requireAdmin()`) ET au niveau base de données (politiques RLS dans `0002_admin.sql`) — deux barrières indépendantes.

## Mode Smart TV (`/tv`)

L'app expose une route `/tv` optimisée pour les navigateurs de Smart TV (Samsung Tizen, LG webOS). Caractéristiques :

- Interface 10-foot UI : grandes vignettes, fond sombre, focus visible épais quand on navigue à la télécommande.
- Navigation au D-pad : ⬆ ⬇ ⬅ ➡ pour passer d'une vignette à l'autre, OK pour valider.
- Sur le lecteur : ⬆ ⬇ change de chapitre, OK lance le plein écran, Échap/Retour revient en arrière.
- Si l'utilisateur n'est pas connecté, l'écran montre l'URL `/login` à ouvrir sur smartphone/PC.

Pour tester en local : `http://localhost:3000/tv`.

Limitations connues : les TVs Apple TV, Android TV et Roku n'ont pas de navigateur web standard. Pour ces plateformes il faudra plus tard une vraie app native.

## Améliorations possibles ensuite

- **Page d'admin** pour gérer le catalogue depuis l'app (au lieu d'éditer la table Supabase).
- **Layout Smart TV** (`/tv`) avec navigation D-pad et focus visible.
- **Téléchargement offline des vidéos** (PWA) — possible seulement si tu migres hors YouTube.
- **Notifications push** quand un nouveau cours est ajouté.
- **i18n** si tu veux un jour ouvrir à l'anglais.
- **Génération automatique des types Supabase** : `supabase gen types typescript --linked > lib/types.generated.ts`.
- **Tests** : Vitest + Playwright pour l'auth flow et le webhook.

---

## Commandes utiles

```bash
npm run dev         # serveur de développement
npm run build       # build de production
npm start           # lance le build prod
npm run lint        # lint
npm run typecheck   # vérification TypeScript
```
