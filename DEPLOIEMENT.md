# Guide de déploiement — pas à pas

Document destiné à toi (Charles) pour pousser cette refonte en production. Suis les étapes dans l'ordre.

---

## Étape 0 — Récupérer le code sur ton Mac

Le code a été préparé dans le dossier de travail de Cowork. Pour l'avoir dans un emplacement à toi :

1. Ouvre le dossier `vincula-formation-nextjs` via le lien `computer://` fourni dans la conversation (Cowork ouvrira le Finder dessus).
2. Glisse-dépose le dossier `vincula-formation-nextjs` vers `~/Documents/` (ou tout endroit qui te convient).

---

## Étape 1 — Créer la branche `refonte-nextjs` sur GitHub

Dans Terminal :

```bash
# Clone ton repo existant (si pas déjà fait)
cd ~/Documents
git clone https://github.com/glukistii/vincula-formation-web.git
cd vincula-formation-web

# Crée une nouvelle branche pour la refonte
git checkout -b refonte-nextjs

# Supprime les anciens fichiers (on garde l'historique git)
rm -rf api index.html push-to-github.sh

# Copie le contenu du nouveau projet
cp -R ~/Documents/vincula-formation-nextjs/. .

# Commit
git add -A
git commit -m "feat: refonte complète en Next.js 15 + Supabase + PWA"
git push -u origin refonte-nextjs
```

Tu auras alors une branche `refonte-nextjs` sur GitHub que tu peux ouvrir en Pull Request quand tu veux merger.

---

## Étape 2 — Installer les dépendances en local

```bash
cd ~/Documents/vincula-formation-web   # ou là où tu as mis le projet
npm install
```

Si tu vois une erreur sur `react@19.0.0-rc-…` : c'est normal, Next.js 15 utilise une version RC de React. Vercel saura la résoudre. En local, fais simplement `npm install --legacy-peer-deps` si npm rouspète.

---

## Étape 3 — Configurer Supabase

### 3.1 Récupère les clés

- Va sur https://supabase.com/dashboard/projects
- Sélectionne ton projet `vapffndxsudqegyrlvij`
- Settings → API
- Copie : `Project URL`, `anon public`, `service_role` (encore + secret)

### 3.2 Crée le `.env.local`

```bash
cp .env.example .env.local
```

Édite `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://vapffndxsudqegyrlvij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<colle l'anon key>
SUPABASE_SERVICE_ROLE_KEY=<colle la service_role key>
NEXT_PUBLIC_WP_URL=https://www.vincula-formation.com
WOOCOMMERCE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3.3 Applique les schémas SQL

Deux migrations à exécuter dans l'ordre (Supabase Dashboard → SQL Editor → New query) :

1. **`supabase/migrations/0001_init.sql`** — crée les tables `profiles`, `products`, `course_videos`, `purchases` + active RLS + seed les 13 produits actuels.
2. **`supabase/migrations/0002_admin.sql`** — ajoute la colonne `is_admin` et les politiques RLS pour les écritures admin.

Pour chacun : Copie → Run. Vérifie dans **Table Editor** que les 4 tables sont là et que `products` contient 13 lignes.

**Te donner les droits admin :** une fois ton compte créé (étape 4 plus bas), reviens dans le SQL Editor et lance :

```sql
update public.profiles set is_admin = true where email = 'ton@email.com';
```

L'onglet « ⚙️ Admin » apparaîtra dans l'app.

### 3.4 Active l'auth Email

- Authentication → Providers → Email
- Coche "Enable Email provider"
- (Optionnel) Décoche "Confirm email" pour des comptes immédiatement actifs
- Save

### 3.5 Configure les URLs autorisées

- Authentication → URL Configuration
- **Site URL** : `http://localhost:3000` (pour dev) — on le mettra à l'URL Vercel plus tard
- **Redirect URLs** : ajoute
  - `http://localhost:3000/**`
  - `https://vincula-formation-web.vercel.app/**`
- Save

---

## Étape 4 — Test en local

```bash
npm run dev
```

Ouvre http://localhost:3000

Tu devrais voir :
- ✅ La boutique avec les 13 produits
- ✅ Le header avec « Se connecter »
- ✅ Les onglets Boutique / Mes Achats

Teste l'inscription : `/register`. Si tu as désactivé la confirmation email, tu seras redirigé vers `/mes-achats` (vide, normal).

Diagnostic : http://localhost:3000/api/health renvoie le statut des variables d'env.

---

## Étape 5 — Déployer sur Vercel

### 5.1 Configurer Vercel pour utiliser la branche

- Va sur https://vercel.com/dashboard
- Ouvre le projet `vincula-formation-web`
- Settings → Git → Production Branch : pour l'instant **laisse `main`**. On déploie la branche `refonte-nextjs` comme **Preview** d'abord.

### 5.2 Pousser et obtenir une preview

Vu que tu as déjà fait `git push -u origin refonte-nextjs`, Vercel va créer automatiquement un **déploiement preview** à une URL du type `https://vincula-formation-web-git-refonte-nextjs-glukistii.vercel.app`.

### 5.3 Ajouter les variables d'environnement

- Project Settings → Environment Variables
- Ajoute pour les 3 environnements (Production, Preview, Development) :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `WOOCOMMERCE_WEBHOOK_SECRET` (génère une chaîne aléatoire forte, on s'en servira après)
  - `NEXT_PUBLIC_WP_URL=https://www.vincula-formation.com`
  - `NEXT_PUBLIC_SITE_URL=https://vincula-formation-web.vercel.app`

- Re-déploie (Deployments → ⋯ → Redeploy)

### 5.4 Mettre à jour Supabase avec l'URL Vercel

- Supabase → Authentication → URL Configuration
- Ajoute l'URL preview Vercel dans **Redirect URLs**

---

## Étape 6 — Brancher le webhook WooCommerce

### 6.1 Génère un secret

```bash
openssl rand -base64 48
```

Mets cette valeur dans `WOOCOMMERCE_WEBHOOK_SECRET` côté Vercel ET garde-la sous la main pour WP.

### 6.2 Crée le webhook dans WordPress

- Connecte-toi à `vincula-formation.com/wp-admin`
- WooCommerce → Réglages → Avancé → Webhooks → Ajouter
- Remplis :
  - **Nom** : Vincula Next.js — Order updated
  - **Statut** : Actif
  - **Sujet** : `Order updated`
  - **URL de livraison** : `https://vincula-formation-web.vercel.app/api/woocommerce-webhook`
  - **Secret** : celui généré à l'étape 6.1
  - **Version API** : `WP REST API Integration v3`
- Enregistrer
- Refais la même chose avec **Sujet = `Order created`**

### 6.3 Test

Sur WP, fais une commande test (mode "Cash on delivery" ou crée un coupon 100%), marque-la comme `completed`. Vérifie dans Supabase **Table Editor → purchases** qu'une ligne apparaît.

⚠️ Si le webhook répond `skipped: no_profile_for_email`, c'est que l'email de la commande WP n'a pas encore de compte dans l'app. Crée d'abord le compte via `/register` avec le même email, puis re-déclenche la commande (Tools → Webhooks → Logs → re-deliver).

---

## Étape 7 — Quand tout marche, merger sur `main`

```bash
git checkout main
git merge refonte-nextjs
git push origin main
```

Vercel re-déploiera automatiquement sur l'URL prod `https://vincula-formation-web.vercel.app`.

---

## Que faire si ça plante ?

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Module not found: @supabase/ssr` | `npm install` pas fait | `npm install` (ou `npm install --legacy-peer-deps`) |
| Boutique vide en prod | Variables Supabase pas configurées sur Vercel | Settings → Environment Variables |
| Login marche, mais `Mes Achats` vide | Aucun webhook reçu / aucune purchase en DB | Vérifier WC Webhooks → Logs |
| Le webhook répond 401 | Mauvais secret | Re-générer + mettre à jour des deux côtés |
| Erreur RLS | Tu utilises la mauvaise clé côté serveur | Le webhook DOIT utiliser `SUPABASE_SERVICE_ROLE_KEY` (déjà câblé) |

---

## Et après ?

Une fois que tout est stable, on peut attaquer :
- Ajout des vidéos YouTube dans `course_videos` pour chaque produit
- Génération des icônes PWA (manquantes dans `public/icons/`)
- Layout Smart TV optionnel
- Auto-création des comptes Supabase quand un client achète sur WP sans avoir d'app account
