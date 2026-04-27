# Smart Supply Chain — Micro-Warehouse Network for Resilient Logistics (India)

## Overview

A production-ready, full-stack logistics command center built around an
interactive India map of large warehouses and last-mile micro-warehouses.
The platform performs real-time inventory CRUD, shortage detection with
nearest-alternative suggestions (Haversine distance), order fulfillment
with nearest-source auto-routing, role-based dashboards, analytics, and
an AI assistant for operations questions.

## Artifacts

- `artifacts/supply-chain` — React + Vite web app (port 21124, path `/`)
- `artifacts/api-server` — Express 5 API server (port 8080, path `/api`)
- `artifacts/mockup-sandbox` — Component preview sandbox (default)

## Stack

- **Monorepo**: pnpm workspaces, Node.js 24, TypeScript 5.9
- **API**: Express 5 + Drizzle ORM + PostgreSQL, sessions via `express-session`
- **Validation**: `zod/v4`, `drizzle-zod`
- **API codegen**: Orval (React Query hooks + Zod schemas) from `lib/api-spec/openapi.yaml`
- **Frontend**: React + Vite + Tailwind v4, wouter routing, react-leaflet, recharts, lucide-react
- **AI**: OpenAI via Replit AI Integrations (`gpt-5.4`), with deterministic snapshot fallback

## Demo logins (no password — pick a role)

- `admin@scn.in` — Network Administrator
- `manager@scn.in` — Warehouse Operations
- `retail@scn.in` — Retail Partner
- `customer@scn.in` — End Customer

## Key endpoints (`/api/...`)

- `auth/login`, `auth/logout`, `auth/me`
- `users`, `products` (CRUD), `locations` (CRUD + stats), `inventory` (CRUD)
- `inventory/shortages` — flat shortage rows with nearest restock source
- `fulfillment/suggest` — ranked sourcing options
- `orders` — auto-routes new orders to nearest source, decrements stock,
  records inventory events, raises alerts when stock falls below threshold
- `alerts` (list, resolve)
- `analytics/{summary,inventory-trends,demand-by-region,region-heatmap,delivery-efficiency,forecast}`
- `ai/chat` — OpenAI-powered assistant with snapshot context

## Database tables

`users`, `products`, `locations`, `inventory`, `orders`, `alerts`, `inventory_events`

## Key commands

- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod
- `pnpm --filter @workspace/db run push` — push schema (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/supply-chain run dev` — run frontend
- Seed: `cd artifacts/api-server && node build-seed.mjs && node dist/seed.mjs`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
