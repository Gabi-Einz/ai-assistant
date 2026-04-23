## Why

The project has no codebase yet. Before any feature can be built, tested, or deployed, the monorepo skeleton must exist: workspace configuration, build orchestration, shared TypeScript settings, and the correct app/package layout that the hexagonal architecture and all downstream steps depend on.

## What Changes

- Initialize pnpm workspace (`pnpm-workspace.yaml`) declaring `apps/*` and `packages/*`
- Add Turborepo (`turbo.json`) with pipeline tasks: `build`, `dev`, `lint`, `typecheck`
- Create root `package.json` with workspace-level devDependencies (TypeScript, Turborepo, pnpm)
- Create `apps/web/` scaffold — TanStack Start (Vinxi) + React 19 + TypeScript, `package.json`, SSR entry files
- Create `apps/api/` scaffold — Bun + TypeScript placeholder, `package.json`
- Create `packages/shared/` — shared Zod schemas, tRPC router types, tool payload types, `package.json`
- Add root `tsconfig.base.json` with `strict: true`, path aliases for `@repo/shared`
- Add per-app `tsconfig.json` files extending the base
- Add root `.env.example` documenting required environment variables (`MONGODB_URI`, `AI_API_KEY`, `WEATHER_API_KEY`, `BETTERAUTH_SECRET`)
- Add `.gitignore` covering `node_modules`, `dist`, `.env`, Turborepo cache

## Capabilities

### New Capabilities
- `monorepo-setup`: pnpm workspace, Turborepo pipeline, root tsconfig.base.json, app and package scaffolds, .env.example

### Modified Capabilities

## Impact

- Creates the entire project directory structure from scratch
- All subsequent steps (packages/shared, backend, frontend) depend on this scaffold
- No existing code affected — greenfield setup
- Dependencies introduced at root: `turbo`, `typescript`
- Dependencies introduced per app: `@tanstack/start`, `@tanstack/react-router`, `vinxi`, `react`, `react-dom` (web); `@types/bun` (api)
