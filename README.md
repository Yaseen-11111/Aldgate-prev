# Pure Shade Blinds

A premium made-to-measure blinds & shutters website built on the Hillarys service model: no prices are ever shown, customers build a shortlist and book a free in-home measure-and-quote appointment.

## Tech Stack

- **Monorepo:** pnpm workspaces, Node.js 20+, TypeScript 5.9
- **Deployment:** Cloudflare Workers serves the React app and `/api/*`
- **Data:** Cloudflare D1 (managed SQLite), with a checked-in migration and seeded catalogue
- **Validation:** Zod, `drizzle-zod`
- **API Codegen:** Orval (from OpenAPI spec)
- **Frontend:** React + Vite, Zustand (quote shortlist in `localStorage`), Tailwind CSS v4 + shadcn/ui (Radix UI)

---

## Quick Start

### Prerequisites

- **Node.js:** v20 or higher
- **pnpm:** `npm install -g pnpm`

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`. The included local `.env` is already configured with the requested admin password and is ignored by Git.

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

### 4. Run the Application

Open two terminal sessions (e.g. in IntelliJ or VS Code):

```bash
# Terminal 1 — Cloudflare Worker API (http://localhost:8787)
pnpm dev:api

# Terminal 2 — Web Frontend (http://localhost:5173)
pnpm dev:web
```

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
