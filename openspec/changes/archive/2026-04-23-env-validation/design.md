## Context

`apps/api` uses `process.env.X ?? ''` in `container.ts` (AI_API_KEY, WEATHER_API_KEY), `better-auth.adapter.ts` (BETTERAUTH_SECRET), and `index.ts` (PORT). `db/mongo.ts` already throws explicitly for missing `MONGODB_URI`. The web app has no env validation yet; `VITE_API_URL` will be needed by the tRPC client in step 10.

## Goals / Non-Goals

**Goals:**
- Single `env.ts` module in `apps/api` that validates all required vars at process startup, before any connection is opened
- Typed `env` object replaces all `process.env.X ?? ''` call sites in the API
- Root `.env.example` updated with `PORT` and `VITE_API_URL` as the single source of truth

**Non-Goals:**
- Per-app `.env.example` files — unnecessary overhead at this scale; the root file covers everything
- Frontend env validation — Zod validation for web env is deferred to step 10 when the tRPC client is configured and `VITE_API_URL` is actually consumed
- Secrets manager or dotenv loading — Bun reads `.env` automatically in dev; no `dotenv` package needed
- Runtime re-validation — validation runs once at module load, not per-request

## Decisions

### Validate with Zod at module load, not lazily
`env.ts` calls `envSchema.parse(process.env)` at the top level (not inside a function). This ensures any missing variable is caught before `connectDb()` or `initContainer()` runs. If validation fails, `z.ZodError` is thrown and the process exits with a clear error listing missing fields.

**Alternative considered**: lazy validation (validate inside each consumer). Rejected — defers the error to runtime usage, defeating the purpose.

### `z.coerce.number()` for PORT
`process.env.PORT` is always a string. Using `z.coerce.number().int().min(1).max(65535).default(3000)` handles the string→number coercion and provides a sensible default without a separate `Number()` cast in `index.ts`.

### Remove `?? ''` fallbacks — don't keep them as safety nets
The whole point of `env.ts` is to guarantee the values exist. Keeping `?? ''` in call sites would mean two places to update when a variable is renamed and would silently mask a validation failure. All call sites should use `env.X` directly.

### `db/mongo.ts` — replace manual check with env.MONGODB_URI
`mongo.ts` currently throws explicitly for missing `MONGODB_URI`. With `env.ts` validating it at startup, this check is redundant. Update `mongo.ts` to use `env.MONGODB_URI` directly — the manual check can be removed since `env.ts` guarantees the value exists before this code runs.

### Single root `.env.example` as the source of truth
Per-app `.env.example` files add maintenance overhead with no practical benefit at this scale. The root `.env.example` is updated with `PORT` and `VITE_API_URL` (the latter prefixed `VITE_` so Vite exposes it to the client bundle) — it remains the one file a developer copies to get started.

## Risks / Trade-offs

- **Build-time env access**: Bun reads `.env` at runtime, not compile time. If `env.ts` is imported at module level, the process will fail fast in CI if env vars are not set. This is the intended behaviour — CI must provide env vars or use a `.env.test` file.
- **`process.env` typing**: TypeScript types `process.env` as `NodeJS.ProcessEnv` (`Record<string, string | undefined>`). Zod's `parse` narrows the output to the schema shape, but the import of `env` provides the typed values — no additional `@types` changes needed since `@types/bun` is already a dev dependency.
