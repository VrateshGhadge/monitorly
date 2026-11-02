# Monitorly

**Know before your users do.**

Monitorly is a website and API uptime monitoring platform. It checks HTTP/HTTPS endpoints every five minutes, records uptime and response-time history, and sends an email alert when a monitor goes down or recovers.

> Monitorly is currently free while the product is being built. The free plan includes up to **10 monitors**, **5-minute checks**, and **30 days of history**.

- **Live app:** https://monitorly.live
- **API base:** https://api.monitorly.live
- **Health check:** https://api.monitorly.live/health

---

## Demo

Watch Monitorly in action.

<!-- Replace the URL below with your demo video. GitHub renders uploaded video attachments inline. -->
https://github.com/user-attachments/assets/REPLACE_WITH_VIDEO_ID

---

## Features

- **Website and API monitoring** — monitor any public HTTP/HTTPS endpoint.
- **Fast detection** — Cloudflare Cron checks every active monitor every five minutes; a newly created monitor is checked immediately.
- **Email alerts** — get notified when a monitor goes down and when it recovers.
- **30-day analytics** — uptime percentage, response-time graphs, and check history for every monitor.
- **Live dashboard** — monitor status and alerts stream into the UI over Server-Sent Events.
- **Authentication** — email/password and Google Sign-In, with a protected dashboard.
- **Test notifications** — send a test email from Settings to verify email delivery.
- **Responsive marketing site** — landing page with per-route SEO metadata.
- **Account management** — view profile details, send a test notification, and delete an account (password or Google confirmation).

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│ React SPA served from Cloudflare Workers Assets             │
└───────────────┬─────────────────────────────┬───────────────┘
                │ HTTPS / JSON                │ SSE
                ▼                             │
┌─────────────────────────────────────────────┴───────────────┐
│ Cloudflare Worker — Hono API                                │
│                                                             │
│  /api/v1/user/*     auth, Google sign-in, account deletion  │
│  /api/v1/monitor/*  monitors, checks, alerts, test email    │
│  /health            liveness and database health            │
│                                                             │
│  ├── D1 (SQLite)          via Prisma D1 adapter             │
│  ├── Durable Object       per-user SSE fan-out              │
│  ├── Resend               transactional email               │
│  └── Cron Trigger         */5 * * * * outbound checks       │
└─────────────────────────────────────────────────────────────┘
```

### How a check works

1. A Cloudflare Cron Trigger runs every five minutes.
2. `checkAllMonitors()` loads every active monitor.
3. Each monitor is fetched with a **10-second timeout** and a browser-like `User-Agent`.
4. HTTP `2xx` and `3xx` responses are **UP**; everything else — including timeouts and network errors — is **DOWN**.
5. Redirects are followed manually only after the destination passes the same URL safety checks.
6. The check is stored in `MonitorCheck` and broadcast to the user's dashboard over SSE.
7. A status change creates an `Alert`, sends an email through Resend, and broadcasts the alert over SSE.
8. A nightly cron job deletes check rows older than **30 days**.

URLs are validated before every check and redirect:

- only `http:` and `https:`
- no embedded credentials
- no `localhost`, `.local`, or `.localhost`
- no loopback, link-local, or common private IPv4/IPv6 ranges

This prevents the monitoring worker from being used to scan internal infrastructure.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 7, React Router 6 |
| Styling | Tailwind CSS 4, custom CSS design tokens |
| Forms & validation | React Hook Form, Zod, `@hookform/resolvers` |
| Charts & UI | Recharts, Framer Motion, Radix UI, Sonner, Lucide |
| API | Hono 4 on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) via Prisma 7 (`@prisma/adapter-d1`) |
| Realtime | Durable Objects (Server-Sent Events) |
| Email | Resend |
| Auth | JWT (HS256, 24h), bcryptjs, Google Identity Services |
| Tooling | Turborepo, npm workspaces, TypeScript, ESLint |

---

## Repository layout

```text
monitorly/
├── apps/
│   ├── frontend/            React SPA (Vite + Tailwind)
│   │   ├── src/pages/       Landing, auth, dashboard pages
│   │   ├── src/components/  Layout, UI, dashboard, auth components
│   │   ├── src/context/     Auth, theme, toast providers
│   │   ├── src/hooks/       Dashboard data + SSE hook
│   │   └── src/api/         Axios API clients
│   └── backend/             Hono API for Cloudflare Workers
│       ├── src/routes/      User and monitor routes
│       ├── src/services/    Monitor checks, alerts, email, maintenance
│       ├── src/durable-objects/  SSE fan-out per user
│       ├── src/templates/email/  Resend HTML templates
│       └── migrations/      D1 SQL migrations
├── packages/
│   ├── db/                  Prisma schema, generated client, D1 adapter
│   ├── validation/          Shared Zod schemas
│   ├── ui/                  Shared React component scaffolding
│   ├── eslint-config/       Shared ESLint configuration
│   └── typescript-config/   Shared TypeScript presets
├── scripts/                 Install/deploy helpers
├── turbo.json
└── package.json
```

---

## Getting started

### Prerequisites

- **Node.js 18+** (the repo pins `npm@11.5.2`)
- A **Cloudflare** account with Wrangler access
- A **Resend** account and a verified sending domain
- A **Google OAuth Web Client ID** (optional — Google sign-in can be disabled)

### 1. Install

```bash
git clone <your-repo-url>
cd monitorly
npm install
```

### 2. Generate the Prisma client

The generated Prisma client is gitignored, so generate it once after installing:

```bash
npm run db:generate -w @repo/db
```

### 3. Configure the backend

```bash
cp apps/backend/.dev.vars.example apps/backend/.dev.vars
```

Fill in `apps/backend/.dev.vars`:

```dotenv
JWT_SECRET=replace_with_a_long_random_secret
RESEND_API_KEY=re_xxxxxxxxx
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

### 4. Configure the frontend

Create `apps/frontend/.env` for local development:

```dotenv
VITE_BACKEND_URL=http://localhost:8787
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

Create `apps/frontend/.env.production` for production builds:

```dotenv
VITE_BACKEND_URL=https://api.monitorly.live
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

If `VITE_GOOGLE_CLIENT_ID` is empty, the Google button is hidden and only email/password auth is available.

### 5. Apply local database migrations

```bash
npm run db:migrate:d1
```

This applies `apps/backend/migrations/*.sql` to the local D1 database used by `wrangler dev`.

### 6. Run both apps

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev -w backend     # Hono API on http://localhost:8787
npm run dev -w monitorly   # Vite frontend on http://localhost:5173
```

Open http://localhost:5173.

---

## Environment variables

### Backend

Set these in `apps/backend/.dev.vars` locally and as Wrangler secrets in production.

| Variable | Required | Description |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Secret used to sign and verify auth JWTs. Use a long random value. |
| `RESEND_API_KEY` | Yes | Resend API key used for test and alert emails. |
| `GOOGLE_CLIENT_ID` | For Google sign-in | Must match the frontend's `VITE_GOOGLE_CLIENT_ID`. |

Cloudflare bindings configured in `apps/backend/wrangler.jsonc`:

| Binding | Type | Purpose |
| --- | --- | --- |
| `DB` | D1 database | Users, monitors, checks, and alerts. |
| `MONITOR_EVENTS` | Durable Object | One SSE hub per user. |
| `LOGIN_RATE_LIMITER` | Rate limit binding | 10 login/Google attempts per 60 seconds. |

### Frontend

Only variables prefixed with `VITE_` are exposed to the browser.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_BACKEND_URL` | Yes | API origin. Defaults to `https://api.monitorly.live` in `src/config.ts`. |
| `VITE_GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth Web Client ID. |

---

## Database

- **Prisma schema:** `packages/db/prisma/schema.prisma`
- **Generated client:** `packages/db/generated/prisma-client` (gitignored)
- **D1 migrations:** `apps/backend/migrations/*.sql`

The Prisma schema drives the generated client; `packages/db/index.ts` re-exports shared types and status constants. The D1 SQL migrations are what actually create and alter the production database, so **keep both in sync** when changing the data model.

### Models

| Model | Purpose |
| --- | --- |
| `User` | Account identity, optional password hash, optional Google ID. |
| `Monitor` | A monitored URL, type, method, active flag, and current status. |
| `MonitorCheck` | One check result: status, HTTP status code, response time, timestamp. |
| `Alert` | A DOWN or RECOVERY event with `SENT`, `RESOLVED`, or `FAILED` email status. |

### Common database commands

```bash
# Regenerate the Prisma client after schema changes
npm run db:generate -w @repo/db

# Apply migrations to the local D1 database
npm run db:migrate:d1

# Apply migrations to the production D1 database
cd apps/backend
npx wrangler d1 migrations apply monitorly-db --remote
```

---

## API reference

All `/api/v1/monitor/*` routes require `Authorization: Bearer <jwt>`.

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/user/signup` | Create an email/password account. |
| `POST` | `/api/v1/user/login` | Sign in and receive a JWT. |
| `POST` | `/api/v1/user/google` | Exchange a Google credential for a JWT. |
| `DELETE` | `/api/v1/user` | Delete the authenticated account. |

### Monitors

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/v1/monitor` | List monitors with uptime, latency, and graph data. |
| `POST` | `/api/v1/monitor` | Create a monitor (maximum 10 per user). |
| `GET` | `/api/v1/monitor/:id` | Monitor detail with checks and alerts. |
| `PATCH` | `/api/v1/monitor/:id` | Update a monitor. |
| `DELETE` | `/api/v1/monitor/:id` | Delete a monitor and its history. |
| `GET` | `/api/v1/monitor/:id/history` | Check history for a monitor. |
| `GET` | `/api/v1/monitor/:id/stats` | Aggregated uptime and response stats. |
| `GET` | `/api/v1/monitor/alerts` | Alert history for the current user. |
| `GET` | `/api/v1/monitor/test-email` | Send a test notification email. |
| `GET` | `/api/v1/monitor/events` | SSE stream for live monitor and alert updates. |

### Health

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Worker liveness. |
| `GET` | `/health/db` | D1 connectivity check. |

---

## Email

Monitorly sends transactional email through Resend:

- test notification from Settings
- monitor down alerts
- monitor recovery alerts

### Sending domain

The code currently sends from:

```ts
Monitorly <alerts@updates.monitorly.live>
```

`updates.monitorly.live` must be verified in Resend (DKIM, SPF, and MX records). The sender is configured in `apps/backend/src/services/notification.service.ts`.

> Resend's `onboarding@resend.dev` sender only delivers to the email address on the Resend account. Do not use it for production alerts — recipients on other addresses will be rejected.

If Resend rejects an email, the failure is recorded and surfaced:

- the Settings test email shows the real error message;
- a monitor alert is still recorded in-app, but its email status becomes `FAILED` instead of `SENT`/`RESOLVED`.

---

## Deployment

Both apps deploy to Cloudflare Workers.

### 1. Authenticate Wrangler

```bash
npx wrangler login
```

### 2. Create and migrate the production database

Create the D1 database once, then copy its `database_id` into `apps/backend/wrangler.jsonc`:

```bash
npx wrangler d1 create monitorly-db
cd apps/backend
npx wrangler d1 migrations apply monitorly-db --remote
```

### 3. Set backend secrets

```bash
cd apps/backend
npx wrangler secret put JWT_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put GOOGLE_CLIENT_ID
```

### 4. Deploy the backend

```bash
cd apps/backend
npm run deploy
```

This runs `wrangler deploy --minify`. The Worker includes the cron triggers from `apps/backend/wrangler.jsonc`:

- `*/5 * * * *` — check all active monitors
- `0 3 * * *` — prune checks older than 30 days

### 5. Deploy the frontend

```bash
cd apps/frontend
npm run deploy
```

This runs `tsc -b && vite build` and deploys the static output with Cloudflare Workers Assets. The SPA fallback is configured in `apps/frontend/wrangler.jsonc`, so deep links such as `/dashboard/alerts` work on refresh.

### 6. Attach custom domains

In the Cloudflare dashboard, attach:

- `monitorly.live` and `www.monitorly.live` → the `monitorly` frontend Worker
- `api.monitorly.live` → the `backend` Worker

The Wrangler configs define the Workers and bindings; custom domains are managed in the Cloudflare dashboard.

### 7. Configure Google OAuth

In the Google Cloud Console for the OAuth Web Client, add these **Authorized JavaScript origins**:

- `http://localhost:5173`
- `https://monitorly.live`
- `https://www.monitorly.live`

Use the same client ID for `VITE_GOOGLE_CLIENT_ID` and the backend's `GOOGLE_CLIENT_ID` secret.

### Post-deploy checklist

- [ ] `/health` and `/health/db` return `200`.
- [ ] Sign up and sign in with email/password.
- [ ] Sign in with Google.
- [ ] Create a monitor and confirm the first check runs.
- [ ] Send a test email from Settings.
- [ ] Take a monitor down and confirm the DOWN email and live dashboard update.
- [ ] Confirm the 30-day graph data loads.

---

## Scripts

### Root

| Command | Description |
| --- | --- |
| `npm run dev` | Run all apps in parallel with Turborepo. |
| `npm run build` | Run the frontend production build. |
| `npm run lint` | Run workspace linters. |
| `npm run format` | Format TypeScript and Markdown with Prettier. |
| `npm run db:migrate:d1` | Apply D1 migrations to the local database. |

### Backend

| Command | Description |
| --- | --- |
| `npm run dev -w backend` | Start `wrangler dev` on port 8787. |
| `npm run deploy -w backend` | Deploy the Worker with minification. |
| `npm run cf-typegen -w backend` | Regenerate Cloudflare binding types. |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev -w monitorly` | Start Vite on port 5173. |
| `npm run build -w monitorly` | Type-check and build for production. |
| `npm run deploy -w monitorly` | Build and deploy the frontend Worker. |
| `npm run preview -w monitorly` | Preview the production build locally. |
| `npm run lint -w monitorly` | Lint the frontend. |

### Database

| Command | Description |
| --- | --- |
| `npm run db:generate -w @repo/db` | Regenerate the Prisma client. |
| `npm run db:migrate -w @repo/db` | Run Prisma migrate tooling (local schema only). |
| `npm run db:deploy -w @repo/db` | Run Prisma migrate deploy (local schema only). |

> For D1, always use the Wrangler migration commands above. The Prisma commands operate on the local migration SQLite file used for schema diffing, not on Cloudflare D1.

---

## Security notes

- JWTs are signed with HS256 and expire after 24 hours.
- Passwords are hashed with bcrypt.
- Google credentials are verified against Google's JWKS, with the client ID as the audience, and require a verified email.
- Login and Google sign-in are rate-limited through Cloudflare's rate limiting binding.
- CORS is restricted to the configured frontend origins in `apps/backend/src/index.ts`.
- Monitor URLs and redirect targets are validated to block private and local network access.
- Outbound checks time out after 10 seconds.
- Secrets are stored as Wrangler secrets and are never included in the frontend bundle.

If you add a new frontend origin, update the CORS allowlist in `apps/backend/src/index.ts`.

---

## Current scope and roadmap

**Available now**

- Up to 10 monitors per account
- 5-minute checks
- Website and API monitoring
- Down and recovery email alerts
- 30-day uptime and response-time history
- Google and email/password authentication

**Coming next**

- Higher monitor limits
- Faster check intervals
- Team collaboration
- Extended history

---

## Development checks

Before shipping a change:

```bash
npm run lint
npm run build -w monitorly
npx tsc --noEmit -p apps/backend/tsconfig.json
```

When changing the data model, update both:

1. `packages/db/prisma/schema.prisma` and regenerate the client
2. Add a new SQL migration in `apps/backend/migrations/` and apply it locally
