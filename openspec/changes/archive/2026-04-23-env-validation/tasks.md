## 1. Env Schema

- [x] 1.1 Create `apps/api/src/env.ts` exporting `const env` — Zod schema with `MONGODB_URI`, `AI_API_KEY`, `WEATHER_API_KEY`, `BETTERAUTH_SECRET` (all `z.string().min(1)`) and `PORT` (`z.coerce.number().int().min(1).max(65535).default(3000)`); call `envSchema.parse(process.env)` at module level

## 2. Replace process.env Usages

- [x] 2.1 Update `apps/api/src/infrastructure/db/mongo.ts` — remove manual `MONGODB_URI` check, import `env`, use `env.MONGODB_URI` in `new MongoClient(...)`
- [x] 2.2 Update `apps/api/src/infrastructure/container.ts` — import `env`, replace `process.env.AI_API_KEY ?? ''` with `env.AI_API_KEY` and `process.env.WEATHER_API_KEY ?? ''` with `env.WEATHER_API_KEY`
- [x] 2.3 Update `apps/api/src/infrastructure/auth/better-auth.adapter.ts` — import `env`, replace `process.env.BETTERAUTH_SECRET ?? ''` with `env.BETTERAUTH_SECRET`
- [x] 2.4 Update `apps/api/src/index.ts` — import `env`, replace `Number(process.env.PORT ?? 3000)` with `env.PORT`

## 3. Example Files

- [x] 3.1 Update root `.env.example` to add `PORT=` and `VITE_API_URL=` entries with comments

## 4. Type Check

- [x] 4.1 Run `cd apps/api && pnpm exec tsc --noEmit` and confirm zero type errors
