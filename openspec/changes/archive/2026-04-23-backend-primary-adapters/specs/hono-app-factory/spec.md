## ADDED Requirements

### Requirement: createApp factory returns a configured Hono instance
`apps/api/src/infrastructure/http/app.ts` SHALL export `function createApp({ container, auth }: AppConfig): Hono` that mounts the tRPC fetch handler at `all('/trpc/*')` and the BetterAuth handler at `all('/api/auth/*')`. The function SHALL NOT start a server — it only returns a configured `Hono` instance.

#### Scenario: tRPC routes are served under /trpc
- **WHEN** a request is made to any path starting with `/trpc/`
- **THEN** it is handled by the tRPC fetch request handler with the container-backed context

#### Scenario: BetterAuth routes are served under /api/auth
- **WHEN** a request is made to any path starting with `/api/auth/`
- **THEN** it is forwarded to `auth.handler(rawRequest)` and BetterAuth responds

#### Scenario: createApp does not call Bun.serve
- **WHEN** `createApp` is invoked
- **THEN** no server is started; the returned Hono instance can be passed to `Bun.serve` externally

### Requirement: index.ts boots the full server
`apps/api/src/index.ts` SHALL call `connectDb()`, `initContainer(db)`, instantiate BetterAuth, call `createApp`, and pass the Hono app to `Bun.serve` with `PORT` from env (default `3000`).

#### Scenario: Server starts and listens on the configured port
- **WHEN** `bun run src/index.ts` is executed with valid env vars
- **THEN** the server listens on `PORT` (or 3000) and logs the listening address
