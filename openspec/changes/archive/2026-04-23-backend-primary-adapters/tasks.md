## 1. Dependencies

- [x] 1.1 Add `better-auth` to `apps/api/package.json` and run `pnpm install`

## 2. DB Connection Update

- [x] 2.1 Update `apps/api/src/infrastructure/db/mongo.ts` so `connectDb()` returns `{ client: MongoClient, db: Db }` instead of just `Db`; update all call sites accordingly

## 3. BetterAuth Server Adapter

- [x] 3.1 Create `apps/api/src/infrastructure/auth/better-auth.adapter.ts` exporting `function createBetterAuth(client: MongoClient): ReturnType<typeof betterAuth>` — call `betterAuth` with `mongodbAdapter(client)`, `emailAndPassword({ enabled: true })` plugin, and `secret: process.env.BETTERAUTH_SECRET ?? ''`

## 4. tRPC Initialization & Auth Middleware

- [x] 4.1 Create `apps/api/src/infrastructure/trpc/trpc.ts` exporting the `t` instance (`initTRPC.context<AppContext>().create()`), base `procedure`, and `router` — keeps router.ts clean
- [x] 4.2 Create `apps/api/src/infrastructure/trpc/middleware/auth.middleware.ts` exporting `authMiddleware` that calls `auth.api.getSession({ headers: ctx.req.headers })`, throws `TRPCError({ code: 'UNAUTHORIZED' })` if null, otherwise calls `next({ ctx: { ...ctx, userId: session.user.id } })`
- [x] 4.3 Export `authedProcedure = t.procedure.use(authMiddleware)` from `trpc.ts`

## 5. Chat Router

- [x] 5.1 Create `apps/api/src/infrastructure/trpc/routers/chat.router.ts` with `chatRouter = t.router({...})` containing all 6 procedures (`create`, `list`, `search`, `rename`, `togglePin`, `delete`) — all using `authedProcedure` with Zod-validated inputs; map `ChatNotFoundError` → `NOT_FOUND` and `UnauthorizedError` → `FORBIDDEN`

## 6. Message Router

- [x] 6.1 Create `apps/api/src/infrastructure/trpc/routers/message.router.ts` with `messageRouter = t.router({ list: authedProcedure... })` — input `z.object({ chatId: z.string() })`; map `ChatNotFoundError` → `NOT_FOUND` and `UnauthorizedError` → `FORBIDDEN`

## 7. Root tRPC Router

- [x] 7.1 Create `apps/api/src/infrastructure/trpc/router.ts` exporting `appRouter = t.router({ chat: chatRouter, message: messageRouter })` and `type AppRouter = typeof appRouter`

## 8. Hono App Factory

- [x] 8.1 Create `apps/api/src/infrastructure/http/app.ts` exporting `function createApp({ container, auth }): Hono` — mount tRPC via `fetchRequestHandler` at `/trpc/*` using `createContextFactory(container)`, mount BetterAuth at `/api/auth/*`

## 9. Entry Point

- [x] 9.1 Update `apps/api/src/index.ts` to: call `connectDb()` → get `{ client, db }`, call `initContainer(db)`, call `createBetterAuth(client)`, call `createApp({ container, auth })`, then `Bun.serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3000) })`

## 10. Type Check

- [x] 10.1 Run `cd apps/api && pnpm exec tsc --noEmit` and confirm zero type errors
