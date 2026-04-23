## Why

All adapters and use cases exist as isolated classes with no connections between them. The composition root (`container.ts`) is the single file that wires everything together — without it, nothing can run. The tRPC context (`context.ts`) then makes the wired use cases available to every procedure per request.

## What Changes

- `apps/api/src/infrastructure/container.ts` — Composition root: connects to MongoDB, instantiates all secondary adapters and use cases in dependency order, exports a typed `container` object
- `apps/api/src/infrastructure/trpc/context.ts` — tRPC context factory: imports the container, extracts the auth session from the request header, attaches use cases and `userId` to the context object available in every procedure

## Capabilities

### New Capabilities
- `di-container`: The composition root that wires adapters → use cases in a single, statically-typed file; no DI framework used
- `trpc-context`: The tRPC context factory that exposes use cases and the authenticated `userId` to every procedure

### Modified Capabilities

## Impact

- `container.ts` is the only file in the codebase permitted to import concrete adapter classes alongside use case classes together
- `context.ts` imports `container` and is imported by the tRPC router (step 7)
- `apps/api/src/index.ts` will call `connectDb()` and then start the server (step 7); `container.ts` re-exports the `db` handle for that
- No new dependencies introduced — all imports are from packages already installed
- Auth session extraction in `context.ts` is intentionally minimal: reads the `Authorization` header and delegates full validation to BetterAuth (step 7); for now it exposes `userId: string | null`
