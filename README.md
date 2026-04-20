# HealthAI Coach — Frontend Admin

Interface d'administration de la plateforme HealthAI Coach : monitoring des pipelines ETL, analytics utilisateurs, gestion et validation des données.

## Stack technique

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS Variables |
| Composants UI | Radix UI primitives (accessibles) |
| Graphiques | Recharts |
| Tableaux | TanStack Table v8 |
| Data fetching | TanStack Query v5 |
| Formulaires | React Hook Form + Zod |
| Tests E2E | Playwright + axe-core |
| Design system | Storybook 8 |
| Linting | ESLint (Next.js config) |
| Formatage | Prettier + prettier-plugin-tailwindcss |

## Structure du projet

```
src/
├── app/
│   ├── (dashboard)/        # Layout avec sidebar — pages publiques
│   │   ├── overview/       # Dashboard KPIs + métriques temps réel
│   │   ├── analytics/      # Graphiques utilisateurs, nutrition, fitness
│   │   └── pipelines/      # Monitoring des flux ETL
│   └── (admin)/            # Layout avec sidebar — pages admin
│       ├── datasets/        # Consultation & correction des datasets
│       ├── validation/      # Workflow d'approbation
│       └── exports/         # Export JSON & CSV
├── components/
│   ├── ui/                 # Composants génériques (+ stories Storybook)
│   ├── tables/             # DataTable TanStack
│   └── layout/             # Sidebar, PageHeader
├── lib/
│   ├── mock-data.ts        # Données de développement
│   ├── utils.ts            # cn(), formatters FR
│   ├── providers.tsx       # QueryProvider + ToastProvider
│   └── hooks/
│       └── useApi.ts       # Hooks TanStack Query (mock → API)
├── styles/
│   └── globals.css         # Variables CSS, palette, typographie
└── types/
    └── index.ts            # Types TypeScript partagés
e2e/
├── app.spec.ts             # Tests navigation + accessibilité RGAA AA
└── components.spec.ts      # Tests composants critiques
```

## Installation et démarrage

### Prérequis
- Node.js 20+
- npm 10+

### Développement

```bash
# 1. Cloner et installer
npm install

# 2. Copier les variables d'environnement
cp .env.example .env.local

# 3. Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

### Storybook (design system)

```bash
npm run storybook
# → http://localhost:6006
```

### Tests E2E Playwright

```bash
# Lancer les tests (serveur Next.js démarré automatiquement)
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui
```

### Build production

```bash
npm run build
npm run start
```

## Variables d'environnement

```env
# Auth ZITADEL (next-auth)
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000
ZITADEL_ISSUER=http://localhost:8080
ZITADEL_CLIENT_ID=<client_id_app_web_zitadel>
ZITADEL_CLIENT_SECRET=<client_secret>

# API NestJS
NEXT_PUBLIC_NESTJS_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=<api_key>
NEXT_PUBLIC_CLIENT_ID=healthai-admin-front

# ETL FastAPI
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

# Mode mock (développement sans backend)
NEXT_PUBLIC_USE_MOCK=false

# Metabase
NEXT_PUBLIC_METABASE_URL=http://localhost:3002
```

## Docker

```bash
# Via healthai-infra (recommandé)
docker compose up -d healthai-admin

# Build local
docker build \
  --build-arg NEXT_PUBLIC_USE_MOCK=false \
  --build-arg NEXT_PUBLIC_NESTJS_URL=http://localhost:3001 \
  --build-arg NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000 \
  -t healthai-admin:local .
```

> Les variables `NEXT_PUBLIC_*` sont injectées **au moment du build** via `ARG/ENV` dans le Dockerfile.  
> Changer ces valeurs après le build nécessite un rebuild de l'image.

## Connexion à l'API NestJS

Le mode mock est contrôlé par la variable de build `NEXT_PUBLIC_USE_MOCK` :

```env
NEXT_PUBLIC_USE_MOCK=false   # API réelle (production)
NEXT_PUBLIC_USE_MOCK=true    # Données fictives (développement sans backend)
```

## Intégration Metabase

Pour intégrer un dashboard Metabase via iframe signée :

```tsx
// Exemple dans une page Next.js
<iframe
  src={`${process.env.NEXT_PUBLIC_METABASE_URL}/embed/dashboard/TOKEN#bordered=false&titled=false`}
  className="w-full h-[600px] rounded-xl border border-border"
  title="Dashboard Metabase"
/>
```

## Accessibilité (RGAA AA)

- Skip link présent sur toutes les pages (`Aller au contenu principal`)
- Navigation clavier complète (focus-visible sur tous les éléments interactifs)
- `aria-current="page"` sur le lien actif de la sidebar
- `aria-sort` sur les colonnes de tableau triables
- `aria-live="polite"` sur la zone de notifications Toast
- `role="alert"` sur les messages d'erreur/anomalies
- Contraste couleurs conforme WCAG AA (vérifié via axe-core dans les tests Playwright)
- Tests automatisés : `e2e/app.spec.ts` → suite "Accessibilité (RGAA AA via axe-core)"

## Conventions de code

```bash
# Linter
npm run lint

# Formatage
npm run format
```

Les commits suivent la convention [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `chore:` maintenance
- `docs:` documentation
