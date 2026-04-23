## Context

Steps 3–5 produced all the building blocks: port interfaces, use cases, and concrete adapters. This step connects them. The composition root (`container.ts`) is the only file permitted to import both concrete adapter classes and use case classes in the same file — a constraint enforced by the architecture rules.

`context.ts` is a thin factory that makes wired use cases available to every tRPC procedure without each procedure needing to import from the container directly.

## Goals / Non-Goals

**Goals:**
- Implement `initContainer(db)` that instantiates all adapters and use cases in dependency order and returns a typed container object
- Implement a tRPC context factory that spreads use cases and `userId` into the request context
- Export `Container` and `AppContext` types for consumption by the tRPC router (step 7)

**Non-Goals:**
- BetterAuth session validation — `userId` is a placeholder (`string | null`) in this step; real extraction is step 7
- Mounting Hono routes or starting the HTTP server — step 7
- Environment variable validation with Zod — step 9

## Decisions

**`initContainer(db: Db)` is an async factory function, not a module-level singleton**
Repositories need a connected `Db` handle. Since `connectDb()` is async, the container cannot be initialized at module load time. Instead, `initContainer(db)` accepts a `Db` already connected by `index.ts` (step 7). This keeps the module import side-effect-free and makes the container testable by passing a test `Db`.

**Container exported as `Awaited<ReturnType<typeof initContainer>>`**
Rather than manually declaring a `Container` interface, the type is derived from the function's return type. Any change to the wired use cases automatically updates the type without a separate interface to maintain.

**Use cases spread directly into `AppContext`, not nested under a `container` key**
tRPC procedures access `ctx.sendMessage`, `ctx.createChat`, etc. — not `ctx.container.sendMessage`. This keeps procedure code concise and avoids an extra level of indirection. The context factory spreads all container use cases into the context object.

**`userId: string | null` as a placeholder in this step**
Real session extraction requires BetterAuth (step 7). For now, `userId` is always `null`. The tRPC auth middleware (step 7) will throw `UNAUTHORIZED` for null `userId` on protected procedures, so the placeholder is safe — no authenticated procedure can be reached until step 7 sets a real `userId`.

**AI model: `claude-haiku-4-5` via `@ai-sdk/anthropic`**
The `createAnthropic({ apiKey })` factory from `@ai-sdk/anthropic` is called in `initContainer`. The model string `'claude-haiku-4-5'` is hardcoded in the container — fast, cost-effective, supports tool calling. Swapping models requires only changing this one line.

**`buildTools` called inside `initContainer` before `AiSdkProvider`**
`DateTimeProvider` and `WeatherProvider` are instantiated first, passed to `buildTools`, and the resulting tool registry is passed to `AiSdkProvider`. This ensures `AiSdkProvider` has the correct tool registry at construction time.

## Risks / Trade-offs

**[Risk] `initContainer` called multiple times would create duplicate connections** → Mitigation: `index.ts` calls `initContainer` exactly once at startup. The function is not idempotent by design — callers are responsible for single invocation.

**[Risk] `AppContext` grows large as more use cases are added** → Mitigation: The context spreads the container, so adding a use case to the container automatically makes it available in `AppContext`. No manual sync needed.

**[Risk] `userId: null` placeholder means auth errors are deferred to step 7** → Mitigation: Acceptable — no route is reachable until step 7 mounts the tRPC adapter and auth middleware.
