# CODE DEVS DIGITAL — Portfolio & plateforme client

> Concevoir. Innover. Connecter.

Site vitrine bilingue (FR/EN) + espace administrateur complet : projets, services, équipe, devis, tickets de support avec chat par clé unique, avis, pop-ups, actualités, notifications push et assistant IA (Groq).

**Stack :** React 19 · Vite · TypeScript · Tailwind CSS 4 · Supabase (base de données, auth admin, stockage) · Vercel (hébergement + fonction serverless `/api/ai`).

## Fonctionnalités

| Public | Admin (`/#/admin`) |
|---|---|
| Accueil, services, portfolio filtrable (7 projets), équipe, processus, technologies | CRUD projets (logo, capture, technos, fonctionnalités, mise en avant, ordre) |
| Formulaire de devis validé + anti-spam (honeypot, délai, limite 1/min) | CRUD services & équipe (photo, rôle, bio FR/EN) |
| Tickets support → clé `CDD-XXXX-XXXX-XXXX` → chat avec l'équipe | Gestion des devis (statuts) |
| Notifications (cloche + push navigateur) | Tickets : réponse en direct, statut, notification auto au client |
| Avis clients (modérés) | Modération des avis |
| Assistant IA Groq (collecte les coordonnées partagées → prospects) | Prospects collectés par l'IA |
| Pop-ups & actualités par écran | Pop-ups / actualités ciblés par écran, notifications à tous |
| Pages légales, bouton WhatsApp, navigation mobile fixe | Paramètres : coordonnées, réseaux, horaires, stats, clé & modèle Groq, prompt IA |

> ⚠️ Aucune coordonnée n'est inventée : WhatsApp, e-mail, réseaux et horaires sont vides par défaut et se configurent dans **Paramètres**. Les fonctionnalités des projets sont à compléter avec les infos confirmées.

## Démarrage local

```bash
npm install
cp .env.example .env.local   # remplir les valeurs
npm run dev
```

Sans Supabase, le site fonctionne en **mode démo** (données dans le navigateur, mot de passe admin = `VITE_ADMIN_PASSWORD`, `admin` par défaut).

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** → exécuter `supabase/schema.sql` (tables, RLS, fonctions RPC, bucket `media`).
3. **Authentication → Users → Add user** : créer le compte administrateur (e-mail + mot de passe). Désactiver les inscriptions publiques (*Auth → Providers → Email → disable sign ups*).
4. **Project settings → API** : copier l'URL et la clé `anon` dans `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
5. Au premier enregistrement depuis l'admin, le contenu par défaut (projets, services, équipe) est sauvegardé en base.

**Sécurité :** les visiteurs ne peuvent que lire le contenu public et insérer devis/avis/tickets/messages. Les tickets ne sont accessibles qu'avec la clé (RPC `get_ticket`). La clé Groq est stockée dans la table `secrets`, lisible uniquement par l'admin et la fonction serveur.

## Assistant IA (Groq)

- Option recommandée : définir `GROQ_API_KEY` dans Vercel.
- Ou depuis **Admin → Paramètres & IA** : saisir la clé, choisir le modèle, modifier les instructions. La fonction `/api/ai` lit alors la clé via `SUPABASE_SERVICE_ROLE_KEY` (variable serveur).

## Notifications push (Web Push / VAPID)

1. Générer les clés : `npx web-push generate-vapid-keys`
2. Dans Vercel : `VITE_VAPID_PUBLIC_KEY` et `VAPID_PUBLIC_KEY` (clé publique), `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:votre@email`), `SUPABASE_SERVICE_ROLE_KEY`.
3. Les visiteurs s'abonnent via la bannière, la cloche ou automatiquement en créant un ticket (abonnement lié à leur clé de chat) → `api/push-subscribe.js` (table `push_subs`).
4. L'admin envoie une notification (onglet Notifications) ou répond à un ticket → `api/push-send.js` (réservé aux admins authentifiés) livre la notification **même site fermé**. Les abonnements expirés sont nettoyés automatiquement.

Sans clés VAPID, les notifications restent visibles dans la cloche et en notification locale quand le site est ouvert.

## Assistant IA plein écran

Bouton « Assistant » flottant → interface plein écran. L'assistant connaît services, projets, équipe et coordonnées (chargés depuis la base) et peut **agir** : préparer et envoyer une demande de devis, créer un ticket (clé fournie + abonnement push), naviguer vers une page, enregistrer un prospect. Chaque action est confirmée par l'utilisateur.

## Déploiement Vercel

1. Pousser le dépôt sur GitHub → **Import** dans Vercel (framework : Vite).
2. Variables d'environnement : voir `.env.example` (Supabase, Groq, VAPID).
3. Déployer. `vercel.json` configure la sortie `dist` et la fonction `api/ai.js`.

## SEO

- Balises par page (titre, description, Open Graph, Twitter, canonical, hreflang FR/EN) gérées par `src/components/Seo.tsx`.
- Données structurées JSON-LD : Organization / ProfessionalService, WebSite, catalogue de services, liste du portfolio, fil d'Ariane.
- `public/robots.txt`, `public/sitemap.xml` (remplacer `YOUR-DOMAIN.com`), `manifest.webmanifest`, icônes et image de partage `og-image.jpg`.
- Définir `VITE_SITE_URL` pour des URLs canoniques absolues. Soumettre le sitemap dans Google Search Console.

## Partenaires

Admin → **Partenaires** : nom, catégorie, site, logo, image de couverture, présentation FR/EN, ordre, affichage dans le bandeau d'accueil. Page publique `#/partners`.

## Pages légales

Confidentialité, mentions légales, CGU, cookies et accessibilité (`#/privacy`, `#/legal`, `#/terms`, `#/cookies`, `#/accessibility`) avec sommaire et impression. Complétez le numéro RCCM/NIU dans `src/components/Legal.tsx`.

## Structure

```
api/ai.js                 Proxy Groq (serverless Vercel)
public/sw.js, icon.svg    Service worker & icône
supabase/schema.sql       Schéma + RLS
src/lib/defaults.ts       Contenu par défaut & types
src/lib/db.ts             Couche données (Supabase ou localStorage)
src/lib/app.ts            i18n, push, IA, utilitaires
src/components/Site.tsx   Sections publiques
src/components/Widgets.tsx  Pop-ups, assistant IA, support/chat, pages légales
src/components/Admin.tsx  Espace administrateur
```

© 2026 CODE DEVS DIGITAL. Tous droits réservés.
