## ADDED Requirements

### Requirement: Root tRPC router merges chat and message sub-routers
`apps/api/src/infrastructure/trpc/router.ts` SHALL export `appRouter` (the root `Router`) created with `t.router({ chat: chatRouter, message: messageRouter })`. It SHALL also export `type AppRouter = typeof appRouter` for frontend consumption.

#### Scenario: AppRouter type exposes chat and message namespaces
- **WHEN** a variable is typed as `AppRouter`
- **THEN** TypeScript provides access to `chat` and `message` procedure namespaces

#### Scenario: router.ts exports the tRPC initializer building blocks
- **WHEN** other modules import from `router.ts`
- **THEN** they can access `t`, `authedProcedure`, and `appRouter` as named exports

### Requirement: tRPC is initialized with AppContext
`router.ts` SHALL call `initTRPC.context<AppContext>().create()` to produce the `t` instance. The `t` object SHALL expose `t.router`, `t.procedure`, and `t.middleware` for constructing sub-routers and middleware.

#### Scenario: tRPC context type is AppContext
- **WHEN** a procedure handler accesses `ctx`
- **THEN** TypeScript types it as `AppContext`, providing access to all use cases and `userId`
