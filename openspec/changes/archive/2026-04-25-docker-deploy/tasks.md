## 1. Docker Build Context

- [x] 1.1 Create `.dockerignore` at the repo root — exclude `**/node_modules`, `dist`, `.output`, `.vercel`, `.env`, `.env.*`, `.git`, `.turbo`, and `coverage`

## 2. API Dockerfile

- [x] 2.1 Create `apps/api/Dockerfile` with a `deps` stage: `oven/bun:1-alpine`, enable pnpm via `corepack`, copy root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and both `apps/api/package.json` and `packages/shared/package.json`; run `pnpm install --frozen-lockfile --filter=@repo/api... --filter=@repo/shared`
- [x] 2.2 Add a `build` stage to `apps/api/Dockerfile`: inherit from `deps`, copy `apps/api/src`, `apps/api/tsconfig.json`, and `packages/shared/src`; run `bun build apps/api/src/index.ts --outdir apps/api/dist --target bun`
- [x] 2.3 Add a `runner` stage to `apps/api/Dockerfile`: fresh `oven/bun:1-alpine`, `WORKDIR /app`, copy only `--from=build apps/api/dist ./dist`; `EXPOSE 3000`; `CMD ["bun", "dist/index.js"]`

## 3. Local Dev Compose

- [x] 3.1 Create `docker-compose.yml` at the repo root with a `mongo` service using `mongo:7`, port `27017:27017`, and named volume `mongo_data:/data/db`
- [x] 3.2 Add an `api` service to `docker-compose.yml`: build context `.` with `dockerfile: apps/api/Dockerfile`, port `3000:3000`, `env_file: .env`, `depends_on: [mongo]`, and `environment: MONGODB_URI=mongodb://mongo:27017/ai_assistant`
- [x] 3.3 Declare the `mongo_data` volume at the bottom of `docker-compose.yml`

## 4. Vercel Frontend Config

- [x] 4.1 Create `apps/web/vercel.json` with `framework: null`, `buildCommand: "pnpm build"`, `outputDirectory: ".vercel/output"`, and `buildEnv: { "NITRO_PRESET": "vercel" }`

## 5. Verify

- [x] 5.1 Run `docker compose build` from the repo root and confirm the `api` image builds without errors
- [x] 5.2 Run `docker compose up` and confirm the API responds on `http://localhost:3000/trpc/chat.list` (expect 401 UNAUTHORIZED, not a connection error)
