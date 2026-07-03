# Nexora — Shift Scheduling SaaS

Full Next.js 14 (App Router) + TypeScript + Tailwind v4 implementation of the Nexora shift-scheduling app, built from the design reference in `../design/`.

## Stack

- Next.js 14 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4
- Zustand (UI state: theme, density, sidebar, drawers)
- TanStack Query (server state, mock service layer)
- Framer Motion (drawer/modal animations)
- date-fns, cmdk, lucide-react, sonner

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:3000 (redirects to `/login`).

## Route map

| Route | Description |
|---|---|
| `/login`, `/forgot`, `/reset`, `/otp` | Auth flows (`(auth)` route group) |
| `/onboarding` | First-login setup wizard |
| `/dashboard` | Manager dashboard |
| `/schedule` | Week-grid scheduler |
| `/people`, `/people/[id]` | Employee directory + profile drawer |
| `/time-off` | Time-off requests + shift swaps |
| `/attendance` | Live + historical timesheet |
| `/reports` | KPIs, charts, breakdowns |
| `/settings/*` | Company, branding, billing, departments, roles, locations, templates, hours, permissions, integrations, api-keys, audit-log |
| `/m`, `/m/schedule`, `/m/clock`, `/m/more` | Mobile employee-facing companion (`(mobile)` route group) |

## Data layer — mock today, Snowflake-ready

All data currently comes from an **in-memory mock service layer** under `src/services/*.service.ts`. Each file exports `async` functions with a seeded dataset and an artificial 200–600ms delay (`mockDelay()` in `src/lib/utils.ts`) so loading states are exercised realistically.

Every service function's input/output shape is defined by the TypeScript interfaces in `src/types/index.ts` — this is the **contract boundary**. When Snowflake credentials are available, swap the body of each mock function for a real query without touching any component code, because every component consumes services through `@tanstack/react-query`'s `useQuery`/`useMutation`, never the mock arrays directly.

### How to wire up Snowflake

1. Install the Snowflake Node driver: `npm install snowflake-sdk` (or call the Snowflake SQL REST API via `fetch` if you prefer an edge-compatible approach — `snowflake-sdk` is not edge-runtime compatible, so any route using it must run on the Node.js runtime, not Edge).
2. Add connection env vars to `.env.local`:
   ```
   SNOWFLAKE_ACCOUNT=
   SNOWFLAKE_USERNAME=
   SNOWFLAKE_PASSWORD=      # or use key-pair auth
   SNOWFLAKE_WAREHOUSE=
   SNOWFLAKE_DATABASE=
   SNOWFLAKE_SCHEMA=
   SNOWFLAKE_ROLE=
   ```
3. Create `src/lib/snowflake.ts` — a singleton connection pool (`snowflake.createPool(...)`) so API routes / server actions reuse one connection instead of opening one per request.
4. For each `src/services/*.service.ts` file, replace the body of each exported function with a real query against your Snowflake tables, keeping the **exact same function signature and return type**. Recommended pattern: call Snowflake from a Next.js Route Handler (`src/app/api/.../route.ts`) and have the service function `fetch()` that route — this keeps the Snowflake driver out of the client bundle and lets you add auth/caching at the API boundary.
5. Suggested table → service mapping:
   - `EMPLOYEES`, `DEPARTMENTS`, `ROLES`, `LOCATIONS` → `employees.service.ts`
   - `SHIFTS` → `shifts.service.ts`
   - `TIME_OFF_REQUESTS`, `SHIFT_SWAPS` → `time-off.service.ts`
   - `ATTENDANCE_EVENTS` → `attendance.service.ts`
   - Aggregation views/materialized views for KPIs → `reports.service.ts`
   - `NOTIFICATIONS` → `notifications.service.ts`
6. Once a service is swapped to real data, delete its seeded mock arrays — TypeScript will immediately flag any component relying on a removed mock-only field, which is the safety net for catching contract drift.

No component, page, or hook should need to change when you do this — that's the whole point of the service boundary.

## Known limitations / next steps

- Auth (`/login` etc.) is fully built UI with a simulated network delay; there is no real session/auth backend yet. Wire up NextAuth/Auth.js, Clerk, or a custom JWT flow against your real user table when ready.
- Drag-and-drop shift editing in `/schedule` is not yet wired (cards are clickable to open the detail drawer, but not draggable) — see the design handoff README §9 for the recommended `@dnd-kit/core` approach.
- Reports charts are hand-rolled inline SVG (no charting library dependency) to keep bundle size down — swap for `recharts`/`visx` if more chart types are needed later.
