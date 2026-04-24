## Why

Environment variables are currently consumed with `process.env.X ?? ''` fallbacks scattered across infrastructure files, meaning the server starts without any guarantee that required secrets are present. A missing `MONGODB_URI` or `AI_API_KEY` causes silent failures or unhelpful runtime errors deep in the call stack. Validating at startup with Zod surfaces configuration problems immediately and removes `?? ''` noise from all call sites.

## What Changes

- Add `apps/api/src/env.ts` — Zod schema that parses and validates `process.env` at module load; exports a typed `env` object; throws with a clear error message if any required variable is absent
- Replace `process.env.X ?? ''` usages in `container.ts`, `better-auth.adapter.ts`, and `index.ts` with `env.X`
- Update root `.env.example` to add `PORT` and `VITE_API_URL` entries with comments — kept as the single source of truth for all vars

## Capabilities

### New Capabilities
- `api-env-schema`: Zod-validated env object for `apps/api` that fails fast on startup if required variables are missing

### Modified Capabilities
<!-- none — no existing spec-level behavior changes -->

## Impact

- `apps/api/src/env.ts` — new file; imported by `container.ts`, `better-auth.adapter.ts`, `db/mongo.ts`, `index.ts`
- `apps/api/src/infrastructure/container.ts` — use `env.AI_API_KEY`, `env.WEATHER_API_KEY`
- `apps/api/src/infrastructure/auth/better-auth.adapter.ts` — use `env.BETTERAUTH_SECRET`
- `apps/api/src/infrastructure/db/mongo.ts` — use `env.MONGODB_URI`
- `apps/api/src/index.ts` — use `env.PORT`
- `.env.example` (root) — add `PORT` and `VITE_API_URL` entries
