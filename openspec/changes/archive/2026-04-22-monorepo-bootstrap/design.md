## Context

Greenfield project. No code exists. The stack requires coordinating two runtimes (TanStack Start/Vinxi for `apps/web`, Bun for `apps/api`) and one shared package (`packages/shared`) that both consume. TypeScript strict mode is mandatory across all packages. The hexagonal architecture of `apps/api` requires path aliases (`@repo/shared`) to reference shared types without relative path hell.

## Goals / Non-Goals

**Goals:**
- Functional pnpm workspace where `pnpm install` from root installs all dependencies
- Turborepo pipeline that can `build`, `dev`, `lint`, and `typecheck` across all packages with correct dependency ordering
- Single `tsconfig.base.json` enforcing `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Per-app `tsconfig.json` files that extend base and add runtime-specific lib/target
- `packages/shared` resolvable as `@repo/shared` in both apps via path aliases
- `.env.example` at root documenting all required secrets

**Non-Goals:**
- Implementing any application logic (features start in step 2+)
- CI/CD pipeline configuration (step 15)
- Docker setup (step 15)
- Installing feature-level dependencies (Hono, HeroUI, BetterAuth, AI SDK, etc.) — those belong in later steps
- Note: `@tanstack/start`, `vinxi`, `react`, `react-dom` ARE included here — they are the runtime foundation of `apps/web`, not feature dependencies

## Decisions

**pnpm over npm/yarn**
pnpm is required by project spec. Strict isolation via symlinked `node_modules` prevents phantom dependency bugs common in hoisted setups. `.npmrc` sets `shamefully-hoist=false`.

**Turborepo over Nx / custom scripts**
Turborepo is lighter, zero-config for this scale, and natively understands pnpm workspaces. Pipeline declared in `turbo.json` with `dependsOn: ["^build"]` ensures `packages/shared` builds before apps consume it.

**`packages/shared` as internal package (not published)**
`"name": "@repo/shared"` with `"private": true`. Both apps reference it via `workspace:*` in their `package.json`. TypeScript resolves it through `paths` in `tsconfig.base.json`. No build step needed during dev — source files consumed directly via path alias.

**tsconfig `strict` flags**
`strict: true` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enforced at the base level. Per-app configs only override `target`, `lib`, and `module` to match their runtime (`DOM` for web, `ESNext` for Bun). This prevents type drift between apps.

**TanStack Start over plain Vite for `apps/web`**
The SSR requirements (`/auth` server-side render + session validation, `/chat` initial data prefetch) cannot be satisfied with Vite alone without a custom SSR adapter. TanStack Start is the official meta-framework for TanStack Router with SSR built in — it uses Vinxi (which wraps Vite) as its build tool, so Vite is still the underlying bundler. `apps/web` uses `vinxi dev` / `vinxi build` instead of `vite dev` / `vite build`. The app directory follows TanStack Start conventions: `app/router.tsx`, `app/routes/__root.tsx`, `app/client.tsx`, `app/ssr.tsx`.

**Environment variable validation deferred to runtime**
`.env.example` is created here as documentation. Zod validation of env vars is implemented in step 9 (once the packages that use them exist). This avoids a circular dependency between scaffold and application code.

## Risks / Trade-offs

- **pnpm hoisting conflicts**: Some packages assume hoisted `node_modules`. Mitigation: add specific `public-hoist-pattern` entries in `.npmrc` only as needed (BetterAuth and tRPC may need this).
- **Turborepo cache on Windows**: Turborepo cache uses file hashing; Windows paths with spaces can cause issues. Mitigation: project path contains no spaces (`ai_assistant`).
- **`packages/shared` without a build step**: Direct source consumption works in dev but requires apps to include `shared/src` in their `tsconfig.include`. Mitigation: explicit `include` paths in each app's tsconfig.
- **Bun vs Node module resolution**: `apps/api` runs on Bun which has its own module resolver. Mitigation: `tsconfig` for api sets `"moduleResolution": "bundler"` which Bun supports natively.
