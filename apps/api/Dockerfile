# Stage 1: Install workspace dependencies
# Only package manifests are copied so this layer is cached unless lockfiles change.
# If new workspace packages are added, add their package.json COPY here too.
FROM oven/bun:1-alpine AS deps
WORKDIR /app

RUN apk add --no-cache nodejs npm && npm install -g pnpm@9.15.9

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --filter=@repo/api... --filter=@repo/shared

# Stage 2: Build bundled output
FROM deps AS build
WORKDIR /app

COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/shared/src ./packages/shared/src

RUN cd apps/api && bun build src/index.ts --outdir dist --target bun

# Stage 3: Minimal runtime image
FROM oven/bun:1-alpine AS runner
WORKDIR /app

COPY --from=build /app/apps/api/dist ./dist

EXPOSE 3000
CMD ["bun", "dist/index.js"]
