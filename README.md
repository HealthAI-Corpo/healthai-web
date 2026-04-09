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

## Docker

```bash
# Build et démarrage
docker compose up --build

# Le frontend tourne sur le réseau healthai-network
# partagé avec le backend NestJS et Metabase
```

> ⚠️ Créer le réseau Docker au préalable si besoin :
> `docker network create healthai-network`

## Connexion à l'API NestJS

Les données sont actuellement mockées dans `src/lib/mock-data.ts`.

Pour brancher l'API réelle, modifier `src/lib/hooks/useApi.ts` :

```ts
// Avant (mock)
async function fetchUsers(): Promise<User[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_USERS;
}

// Après (API réelle)
async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
  if (!res.ok) throw new Error("Erreur fetch users");
  return res.json();
}
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
