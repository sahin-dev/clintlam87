# SM PRO — Web client

SM PRO connects a builder's plan sets to delivered, invoiced materials: AI takeoffs, material requests, supplier quotes, purchase orders, deliveries and accounting in one traceable workspace. This repository is the web client. It contains three products that share one design system:

| Surface | Entry point | Who it's for |
| --- | --- | --- |
| Builder workspace | `/signin` | General contractors and home builders |
| Supplier portal | `/supplier/auth` | Lumber yards and building-material suppliers |
| Platform console | `/admin/access` | SM PRO operators (super admin) |

> **Status:** front-end complete, backend not yet connected. All records come from typed sample data in `src/data/` and live in memory. See [Connecting a backend](#connecting-a-backend).

## Stack

- React 18 + TypeScript (strict), built with Vite 5
- React Router 7, with every screen code-split
- Tailwind CSS 3, using the SM PRO tokens in `tailwind.config.js`
- Inter (self-hosted via `@fontsource-variable/inter`) and `lucide-react` icons

## Getting started

Requires Node 18.18 or newer.

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint over `src/` |
| `npm run check` | Type-check and lint (use in CI) |

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_DEMO_MODE` | `true` | Shows the sample-account shortcuts and pre-filled credentials on the sign-in screens. Set it to `false` once a real identity provider is connected. |

## Project layout

```
src/
  App.tsx              Route table (lazy-loaded screens) and providers
  config.ts            Runtime flags read from VITE_* env vars
  components/
    app/               Error boundary, route loading
    ui/                Design-system primitives (Button, Card, Badge, Logo…)
    shell/ supplier/ admin/   Navigation shells for each surface
    smpro/ takeoff/    Domain components (drawing viewer, verification…)
  contexts/            App, Supplier, Admin and Exchange state providers
  data/                Typed sample data (replace with API calls)
  pages/               One module per screen, grouped by area
  types/               Domain types shared by data and UI
  utils/               Formatting and role-based access helpers
public/
  images/              Optimised photography (WebP)
  drawings/            Vector drawing sheets used by the takeoff viewer
```

## Design system

- **Colour:** `brand` (SM PRO orange) for primary actions and attention, `ink` for text and structure, and semantic `positive`, `info`, `caution` and `danger` scales for status.
- **Type:** Inter throughout. Use `.measure` for quantities, money and identifiers (tabular figures) and `.spec-label` for field labels.
- **Geometry:** a tight 2–4px radius scale suited to construction documents. `rounded-full` is reserved for avatars and status dots.
- **Layering:** custom classes live in Tailwind's `components` layer, so utilities always override them.

## Deployment

`npm run build` emits a static single-page app in `dist/`. Any static host works (Vercel, Netlify, S3 + CloudFront, nginx), provided **unknown paths fall back to `index.html`** so client-side routes resolve on reload. Hashed files under `dist/assets/` can be cached immutably. `index.html` should not be cached.

Hidden source maps are generated for upload to an error-monitoring service. They are not referenced from the shipped bundles.

## Connecting a backend

The UI is complete, but these pieces must exist before real customers can use it:

1. **Authentication.** Replace the sample-account checks in `pages/auth`, `pages/supplier/SupplierAuth.tsx` and `pages/admin/AdminAuth.tsx` with your identity provider, and keep sessions in HTTP-only cookies rather than `localStorage`. Then set `VITE_DEMO_MODE=false`.
2. **Data access.** The contexts in `src/contexts/` expose the operations each screen needs (`approveTakeoff`, `approveOrder`, `setRfqStatus`, and so on). Back them with API calls and a query cache instead of in-memory seed state.
3. **Authorisation.** `utils/rbac.ts` and `utils/supplierRbac.ts` gate the UI only. Every permission must also be enforced server-side.
4. **File storage.** Plan-set uploads (`hooks/useDrawingUpload.ts`) currently stay in the browser. Send them to object storage and the takeoff pipeline.
5. **Monitoring.** Wire `reportError` in `components/app/ErrorBoundary.tsx` to Sentry or an equivalent service.
