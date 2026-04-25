## Context

The backend runs on Bun with Hono and connects to MongoDB. The frontend is a TanStack Start (Vinxi/Nitro) app. Neither has deployment artifacts today. The constraints from requirements: frontend on Vercel, backend on a Bun-compatible host, pnpm workspace monorepo at the root.

## Goals / Non-Goals

**Goals:**
- `apps/api/Dockerfile` — multi-stage image that produces a minimal runnable API container
- `docker-compose.yml` at repo root — one-command local dev with MongoDB + API wired together
- `apps/web/vercel.json` — configuration so Vercel can build and serve the TanStack Start frontend
- `.dockerignore` at repo root — exclude node_modules, dist, and secrets from the Docker build context

**Non-Goals:**
- No CI/CD pipeline (GitHub Actions, etc.)
- No production Kubernetes/ECS manifests
- No multi-environment (staging/prod) overrides in docker-compose
- No SSL/TLS termination in the container
- No changes to application source code (`src/` files or `app.config.ts`)

## Decisions

**Multi-stage Dockerfile (three stages)**

Stage `deps`: Uses `oven/bun:1-alpine`. Copies only the `package.json` manifests and lockfile needed by pnpm, then runs `pnpm install --frozen-lockfile` for just the API and shared packages. Keeping this as its own stage means Docker can cache dependency installs unless lockfiles change.

Stage `build`: Inherits from `deps`. Copies source files and runs `bun build` to produce a single bundled JS output at `apps/api/dist/index.js`. Bundling avoids shipping the full `node_modules` tree in the final image.

Stage `runner`: Starts from a fresh `oven/bun:1-distroless` (or `oven/bun:1-alpine` if distroless isn't available) and copies only `dist/index.js`. No source, no dev tools, minimal attack surface. Exposes port 3000 and runs `bun dist/index.js`.

Alternatives considered: Skipping the build stage and running TypeScript directly with `bun src/index.ts`. Rejected because it would require copying all source files and the full workspace into the runner image.

**docker-compose.yml at repo root**

Uses `mongo:7` (official image) with a named volume for persistence. The API service builds from `apps/api/Dockerfile` with the repo root as context. The `MONGODB_URI` env var overrides the `.env` value to point at the compose MongoDB service (`mongodb://mongo:27017/ai_assistant`). `depends_on` with `service_started` condition ensures Mongo starts before the API.

A `.env.example` is not created by this change (out of scope); the user is expected to supply `.env` values for `AI_API_KEY`, `WEATHER_API_KEY`, and `BETTERAUTH_SECRET`.

**Vercel deployment for TanStack Start (Vinxi/Nitro)**

Vinxi uses Nitro under the hood. Setting `NITRO_PRESET=vercel` at build time switches the output to `.vercel/output` — the directory Vercel's build system expects. The `apps/web/vercel.json` sets `framework: null` (Vercel auto-detection would misidentify Vinxi), `buildCommand: "pnpm build"`, and `outputDirectory: ".vercel/output"`.

`NITRO_PRESET=vercel` is set via `vercel.json`'s `buildEnv` so no change to `app.config.ts` is needed.

The Root Directory for the Vercel project must be set to `apps/web` in the Vercel dashboard (or equivalent) so that pnpm resolves workspace dependencies correctly. Build command remains `pnpm build`; install command is `pnpm install --frozen-lockfile`.

Alternatives considered: Adding `server: { preset: 'vercel' }` directly in `app.config.ts`. Rejected because it would break local dev (Nitro would output to `.vercel/output` instead of `.output`) and constitutes a source file change outside the scope of this step.

## Risks / Trade-offs

[pnpm workspace in Docker context] → The Dockerfile must COPY all `package.json` files that pnpm workspace resolution touches before running `pnpm install`. If new workspace packages are added later, the Dockerfile's COPY list must be updated. Mitigation: document the pattern in a comment inside the Dockerfile.

[Vercel Root Directory setting] → The `vercel.json` alone cannot set the Root Directory — it must be configured in the Vercel project settings UI or CLI. Mitigation: note this in the tasks.

[bun build bundling] → `bun build` bundles all imports. If any package uses dynamic requires or non-bundleable native modules (e.g., `mongodb` with native BSON), bundling may fail. Mitigation: the `apps/api/package.json` already has a working `build` script (`bun build src/index.ts --outdir dist --target bun`) — use that exact command in the Dockerfile so failures surface during the build stage, not at runtime.

[MongoDB startup race] → `depends_on: service_started` only waits for the container to start, not for Mongo to be ready. The API will retry connection on startup (handled in `connectDb()`). Mitigation: `connectDb` should already handle this; if not, a `healthcheck` can be added to the Mongo service.
