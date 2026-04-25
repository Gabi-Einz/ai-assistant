## ADDED Requirements

### Requirement: API has a multi-stage Dockerfile
`apps/api/Dockerfile` SHALL produce a runnable container image for the Bun-based API using a three-stage build: dependency install, source build, and minimal runtime.

#### Scenario: Dependency stage installs only API and shared packages
- **WHEN** Docker builds the `deps` stage
- **THEN** only `apps/api/package.json`, `packages/shared/package.json`, `package.json`, `pnpm-workspace.yaml`, and the lockfile are present before `pnpm install` runs, so the layer is cacheable independently of source changes

#### Scenario: Build stage produces a bundled output
- **WHEN** Docker builds the `build` stage
- **THEN** `bun build src/index.ts --outdir dist --target bun` runs and outputs `apps/api/dist/index.js`

#### Scenario: Runner stage contains only the built artifact
- **WHEN** the final image is inspected
- **THEN** it contains `dist/index.js` and the Bun runtime but no source files or `node_modules`

#### Scenario: Container starts and listens on port 3000
- **WHEN** the image is run with the required environment variables set
- **THEN** the API process binds to port 3000 and responds to HTTP requests

### Requirement: Repo has a .dockerignore file
`.dockerignore` at the repo root SHALL exclude large or sensitive directories from the Docker build context.

#### Scenario: node_modules directories are excluded
- **WHEN** Docker reads the build context
- **THEN** no `node_modules` directory at any depth is sent to the daemon

#### Scenario: Build artifacts and secrets are excluded
- **WHEN** Docker reads the build context
- **THEN** `dist`, `.output`, `.vercel`, `.env`, `.env.*`, and `.git` are not included in the context

### Requirement: Repo has a docker-compose.yml for local development
`docker-compose.yml` at the repo root SHALL define two services — `mongo` and `api` — to enable one-command local startup.

#### Scenario: MongoDB starts with a persistent volume
- **WHEN** `docker compose up` is run
- **THEN** a `mongo:7` container starts and mounts a named volume so data persists across restarts

#### Scenario: API service connects to the compose MongoDB
- **WHEN** the `api` service starts
- **THEN** it uses `MONGODB_URI=mongodb://mongo:27017/ai_assistant` (overriding any value in `.env`) to connect to the compose MongoDB service

#### Scenario: API service builds from the repo root context
- **WHEN** `docker compose build` is run
- **THEN** Docker uses the repo root as context and `apps/api/Dockerfile` as the Dockerfile

#### Scenario: API starts after MongoDB
- **WHEN** `docker compose up` is run
- **THEN** the `api` service declares `depends_on: mongo` so MongoDB starts first

### Requirement: Frontend has a vercel.json deployment config
`apps/web/vercel.json` SHALL configure Vercel to build and serve the TanStack Start (Vinxi/Nitro) frontend without relying on Vercel's auto-detection.

#### Scenario: Vercel uses the correct build command and output directory
- **WHEN** Vercel runs a build for the `apps/web` project
- **THEN** it executes `pnpm build` and expects the output at `.vercel/output`

#### Scenario: Nitro Vercel preset is activated at build time
- **WHEN** Vercel builds the project
- **THEN** `NITRO_PRESET=vercel` is set as a build-time environment variable so Vinxi outputs to `.vercel/output`

#### Scenario: Vercel framework auto-detection is disabled
- **WHEN** Vercel processes the project
- **THEN** `framework` is set to `null` in `vercel.json` to prevent misidentification of the Vinxi app
