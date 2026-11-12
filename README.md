# Pure Shade Blinds

A made-to-measure blinds and shutters website where customers build a shortlist and book a free in-home measure-and-quote appointment.

## Tech Stack

- **Monorepo:** pnpm workspaces, Node.js 20+, TypeScript 5.9
- **Deployment:** Cloudflare Workers serves the React app and `/api/*`
- **Data:** Cloudflare D1 (managed SQLite), with a checked-in migration and seeded catalogue
- **Validation:** Zod, `drizzle-zod`
- **API Codegen:** Orval (from OpenAPI spec)
- **Frontend:** React + Vite, Zustand (quote shortlist in `localStorage`), Tailwind CSS v4 + shadcn/ui (Radix UI)

---

## Quick Start

### Local mirror preview

From the repository root, start the local mirror with:

```bash
pnpm install
pnpm --filter @workspace/web dev:local
```

Open `http://127.0.0.1:5173/` for the website or `http://127.0.0.1:5173/admin` for admin. Sign in with the local-only username `admin` and password `7291` (or set `LOCAL_ADMIN_PASSWORD` before starting). This command includes the local preview API; **do not start `dev:api` for the mirror**. The preview listens on loopback and never connects to the production database for writes.

In the preview admin panel, choose **Refresh live public content** to copy products, gallery, and site settings. To copy private consultations, sign in to the live admin site, open **Consultations**, download `consultations.csv`, and import it in the local preview. The export includes private customer details and notes, so keep the file on your own computer. Local changes are stored in ignored `.local/preview-data.json`; refreshing or importing replaces the respective local copy. These actions are manual and do not poll Cloudflare.

For on-page editing, sign in at the admin hostname (or the local preview), choose **Open website to edit on the page**, then select **Edit this page**. Pencil buttons edit headings, page copy, product text, and gallery captions in place. Save updates the same records used by the existing admin editors. Product photos, gallery media, and the remaining settings stay available in the admin portal.

### Prerequisites

- **Node.js:** v20 or higher
- **pnpm:** `npm install -g pnpm`

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` for the Worker development environment. The local mirror command above uses its own loopback-only sign-in.

```bash
cp .env.example .env
```

### 3. Provision D1 & Configure Secrets

```bash
# Provision D1 Database
pnpm --filter @workspace/api-server exec wrangler login
pnpm --filter @workspace/api-server db:create

# Copy the returned database_id into apps/api/wrangler.jsonc, then run:
pnpm --filter @workspace/api-server db:migrate

# Set Cloudflare Secrets
pnpm --filter @workspace/api-server exec wrangler secret put SESSION_SECRET
pnpm --filter @workspace/api-server exec wrangler secret put ADMIN_PASSWORD
```

### 4. Run the Worker API and frontend locally

Open two terminal sessions (e.g. in IntelliJ or VS Code):

```bash
# Terminal 1 — Cloudflare Worker API (http://localhost:8787)
pnpm dev:api

# Terminal 2 — Web Frontend (http://localhost:5173)
pnpm dev:web
```

This is the separate Worker development setup. It uses a local D1 database and requires the Worker environment configured above. To apply migrations to that **local** database, run `pnpm --filter @workspace/api-server db:migrate:local`. The `db:migrate` script targets the production D1 database.

- **Storefront:** [http://localhost:5173](http://localhost:5173)
- **Admin Portal:** [http://localhost:5173/admin](http://localhost:5173/admin)

> **PowerShell Tip:** To start both servers in one command:
> ```powershell
> Start-Process -FilePath "pnpm.cmd" -ArgumentList "dev:api" -WorkingDirectory (Get-Location); pnpm dev:web
> ```

---

## Project Layout

```text
apps/
  api/             Cloudflare Worker API and D1 migrations
  web/             React + Vite storefront
packages/
  api-spec/        OpenAPI source of truth for routes and types
  api-client/      Generated React Query hooks
  api-contract/    Generated Zod schemas
  data/            Legacy local development data (not used in production)
tools/
  scripts/         Developer setup and seed utilities
  mockup/          Component preview utility
assets/
  source/          Original image assets
data/
  store.json       Automatically-created local catalogue and quote data
database/
  legacy/          Previous SQL seed material, kept only for reference
```

---

## Key Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev:api` | Start the Cloudflare Worker locally |
| `pnpm dev:web` | Start the Vite frontend development server |
| `pnpm --filter @workspace/web dev:local` | Start the standalone local mirror, including its preview API |
| `pnpm --filter @workspace/api-server db:migrate:local` | Apply D1 migrations locally |
| `pnpm --filter @workspace/api-server db:migrate` | Apply D1 migrations to production |
| `pnpm deploy` | Build and deploy the Worker plus static site |
| `pnpm typecheck` | Run full TypeScript type checking |
| `pnpm build` | Typecheck and build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and types from OpenAPI spec |

---

## Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `SESSION_SECRET` | **Yes** | Cloudflare Worker secret for signing admin sessions |
| `ADMIN_PASSWORD` | **Yes** | Cloudflare Worker secret for `/admin` access |

---

## Architecture Notes

- **No Price Display:** By design (Hillarys-style "free home quote" model), prices are never displayed across the app.
- **Client-Side Shortlist:** Managed via Zustand with `localStorage` persistence; no server-side cart state required.
- **Admin Authentication:** Single shared password, authenticated via `POST /admin/login`, issuing short-lived JWT tokens.
- **Quote Requests:** Generated server-side only upon checkout/booking submission.
