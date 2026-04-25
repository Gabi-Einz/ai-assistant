## Why

The project has no deployment artifacts: no Dockerfile, no local dev orchestration, and no Vercel configuration. Without these, the backend cannot be containerized or hosted, and the frontend cannot be deployed to Vercel. This is the final infrastructure step before the project is deliverable.

## What Changes

- Add `apps/api/Dockerfile` — multi-stage Bun image that builds and runs the API
- Add `docker-compose.yml` at the repo root — spins up MongoDB + API together for local dev
- Add `apps/web/vercel.json` — tells Vercel how to build and serve the TanStack Start (Vinxi) frontend
- Add `.dockerignore` at the repo root to exclude `node_modules`, `dist`, and dev artifacts from the Docker context

## Capabilities

### New Capabilities

- `deployment-config`: Dockerfile, docker-compose, and Vercel config that make the application deployable and reproducibly runnable in local dev

### Modified Capabilities

<!-- none -->

## Impact

- **apps/api/**: gains `Dockerfile` and is referenced in `docker-compose.yml`
- **apps/web/**: gains `vercel.json`
- **repo root**: gains `docker-compose.yml` and `.dockerignore`
- **No code changes** to any source files — deployment artifacts only
- **No new runtime dependencies** — uses Bun and MongoDB images already in the stack
