## 1. Root Configuration

- [x] 1.1 Create `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`
- [x] 1.2 Create root `package.json` with `name: "ai-assistant"`, `private: true`, devDependencies: `turbo`, `typescript`
- [x] 1.3 Create `.npmrc` with `shamefully-hoist=false` and `strict-peer-dependencies=false`
- [x] 1.4 Create `turbo.json` with pipeline tasks: `build` (`dependsOn: ["^build"]`), `dev`, `lint`, `typecheck`
- [x] 1.5 Create root `tsconfig.base.json` with `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `moduleResolution: "bundler"`, `esModuleInterop: true`
- [x] 1.6 Create root `.gitignore` covering `node_modules/`, `dist/`, `.env`, `.turbo/`, `*.local`
- [x] 1.7 Create `.env.example` with `MONGODB_URI`, `AI_API_KEY`, `WEATHER_API_KEY`, `BETTERAUTH_SECRET` and inline comments

## 2. packages/shared Scaffold

- [x] 2.1 Create `packages/shared/package.json` with `name: "@repo/shared"`, `private: true`, `main: "./src/index.ts"`
- [x] 2.2 Create `packages/shared/tsconfig.json` extending `../../tsconfig.base.json`
- [x] 2.3 Create `packages/shared/src/index.ts` as empty barrel export
- [x] 2.4 Create `packages/shared/src/schemas/` directory with `.gitkeep`
- [x] 2.5 Create `packages/shared/src/types/` directory with `.gitkeep`

## 3. apps/api Scaffold

- [x] 3.1 Create `apps/api/package.json` with `name: "@repo/api"`, `private: true`, dependency on `@repo/shared: "workspace:*"`, scripts: `dev: "bun run --watch src/index.ts"`, `build: "bun build src/index.ts"`, `typecheck: "tsc --noEmit"`
- [x] 3.2 Create `apps/api/tsconfig.json` extending `../../tsconfig.base.json`, setting `target: "ESNext"`, `lib: ["ESNext"]`, paths alias `@repo/shared` → `../../packages/shared/src`
- [x] 3.3 Create `apps/api/src/index.ts` with a minimal Bun HTTP placeholder (`console.log("api starting")`)
- [x] 3.4 Create hexagonal directory stubs: `src/domain/entities/`, `src/domain/ports/`, `src/domain/errors/`, `src/application/use-cases/chat/`, `src/application/use-cases/message/`, `src/application/dtos/`, `src/infrastructure/http/`, `src/infrastructure/trpc/routers/`, `src/infrastructure/trpc/middleware/`, `src/infrastructure/repositories/`, `src/infrastructure/ai/`, `src/infrastructure/tools/`, `src/infrastructure/auth/` — each with a `.gitkeep`

## 4. apps/web Scaffold (TanStack Start)

- [x] 4.1 Create `apps/web/package.json` with `name: "@repo/web"`, `private: true`, dependencies: `@tanstack/start`, `@tanstack/react-router`, `vinxi`, `react`, `react-dom`; dependency on `@repo/shared: "workspace:*"`; scripts: `dev: "vinxi dev"`, `build: "vinxi build"`, `start: "vinxi start"`, `typecheck: "tsc --noEmit"`
- [x] 4.2 Create `apps/web/tsconfig.json` extending `../../tsconfig.base.json`, setting `target: "ES2020"`, `lib: ["ES2020", "DOM", "DOM.Iterable"]`, `jsx: "react-jsx"`, paths alias `@repo/shared` → `../../packages/shared/src`
- [x] 4.3 Create `apps/web/app.config.ts` — Vinxi/TanStack Start config with path alias `@repo/shared` and SSR enabled
- [x] 4.4 Create `apps/web/app/router.tsx` — TanStack Router instance configured for SSR
- [x] 4.5 Create `apps/web/app/routes/__root.tsx` — root route with `<html>`, `<head>`, `<body>` shell
- [x] 4.6 Create `apps/web/app/client.tsx` — client entry (`StartClient`)
- [x] 4.7 Create `apps/web/app/ssr.tsx` — server entry (`StartServer`) used by Vinxi for SSR rendering

## 5. Verification

- [x] 5.1 Run `pnpm install` from root — zero errors
- [x] 5.2 Run `pnpm turbo typecheck` — passes in all packages
- [x] 5.3 Verify `@repo/shared` import resolves in both `apps/api` and `apps/web` without TS errors
- [x] 5.4 Confirm all hexagonal directories exist under `apps/api/src/`
- [x] 5.5 Confirm `.env` is listed in `.gitignore` output (`git check-ignore .env` returns `.env`)
