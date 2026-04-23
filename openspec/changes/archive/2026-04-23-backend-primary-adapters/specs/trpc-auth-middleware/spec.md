## ADDED Requirements

### Requirement: authMiddleware validates BetterAuth session and injects userId
`apps/api/src/infrastructure/trpc/middleware/auth.middleware.ts` SHALL export `authMiddleware` created with `t.middleware`. It SHALL call `auth.api.getSession({ headers: ctx.req.headers })` and, if no session is found, throw `new TRPCError({ code: 'UNAUTHORIZED' })`. If a valid session is found, it SHALL call `next({ ctx: { ...ctx, userId: session.user.id } })` so that downstream procedures receive `userId` as `string` (not `string | null`).

#### Scenario: Valid session injects userId into context
- **WHEN** an authed procedure is called with a request that has a valid BetterAuth session cookie
- **THEN** `ctx.userId` inside the procedure handler is a non-null string matching the authenticated user's ID

#### Scenario: Missing session throws UNAUTHORIZED
- **WHEN** an authed procedure is called with a request that has no session cookie or an expired session
- **THEN** tRPC returns a response with error code `UNAUTHORIZED` (HTTP 401)

### Requirement: authedProcedure uses authMiddleware
`router.ts` (or a shared procedures module) SHALL export `authedProcedure = t.procedure.use(authMiddleware)`. All chat and message procedures SHALL use `authedProcedure`, never the base `t.procedure`.

#### Scenario: authedProcedure type-narrows userId to string
- **WHEN** a procedure handler built with `authedProcedure` accesses `ctx.userId`
- **THEN** TypeScript types it as `string`, not `string | null` — no null check required
