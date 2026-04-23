## 1. Stream Route Handler

- [x] 1.1 Create `apps/api/src/infrastructure/http/stream.route.ts` exporting `createStreamRoute(container: Container, auth: Auth): Hono` — POST `/stream` handler that: (a) validates BetterAuth session via `auth.api.getSession`, returns 401 if missing; (b) parses and validates `chatId` + `content` from JSON body, returns 400 if invalid; (c) calls `container.sendMessage.execute({ chatId, userId, content })`; (d) streams each `StreamEvent` as `data: <JSON>\n\n` SSE frames using Hono's `streamSSE`; (e) emits `data: [DONE]\n\n` on completion; (f) catches mid-stream errors and emits `data: {"type":"error","message":"..."}\n\n` then `[DONE]`

## 2. Mount Route in App Factory

- [x] 2.1 Update `apps/api/src/infrastructure/http/app.ts` to import `createStreamRoute` and mount it: `app.route('/api', createStreamRoute(container, auth))`

## 3. Type Check

- [x] 3.1 Run `cd apps/api && pnpm exec tsc --noEmit` and confirm zero type errors
